/* Magic Mirror
 * Module: MMM-SvenskFotboll
 *
 * By Tommy Bandzaw, https://github.com/bandzaw/MMM-SvenskFotboll
 * Boost Software Licensed.
 */

const NodeHelper = require('node_helper');
const https = require('node:https');
const cheerio = require('cheerio');

module.exports = NodeHelper.create({

    start: function() {
        console.log('Starting node_helper for: ' + this.name);
    },

    fetchLeagues: async function(urls) {
        this.leagues = [];
        Promise.all(urls.map(url => this.fetchLeague(url)))
            .then(() => {
                this.sendSocketNotification('LEAGUES', this.leagues);
            })
            .catch(error => {
                console.error('Error fetching leagues:', error);
            });
    },

    fetchLeague: function(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';

                // A chunk of data has been received.
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received.
                res.on('end', () => {
                    // Ok, all data received successfully from the server.
                    const $ = cheerio.load(data);

                    const league = {};
                    league.name = $('h1.headline--large').text().trim();
                    league.table = [];
                    $('table.standings-table tr').each((index, row) => {
                        const rowData = [];
                        $(row).find('td').each((index, cell) => {
                            rowData.push($(cell).text().trim());
                        });
                        league.table.push({
                            position: rowData[0],
                            team: rowData[1],
                            played: rowData[2],
                            won: rowData[3],
                            drawn: rowData[4],
                            lost: rowData[5],
                            goalsFor: rowData[6],
                            goalsAgainst: rowData[7],
                            goalDifference: rowData[8],
                            points: rowData[9]
                        });
                    });

                    const upcomingGames = [];
                    $('.match-list__match').each((index, element) => {
                        const homeTeam = $(element).find('.match-list__home .match-list__team-name').text().trim();
                        const awayTeam = $(element).find('.match-list__away .match-list__team-name').text().trim();
                        const dateTime = $(element).find('.match-list__date').attr('datetime');
                        const location = $(element).find('.match-list__location').text().trim();
                    
                        upcomingGames.push({
                            homeTeam: homeTeam,
                            awayTeam: awayTeam,
                            dateTime: dateTime,
                            location: location
                        });
                    });
                    league.upcomingGames = upcomingGames;
                    //TODO: Results (not available right now, so unknown format)
                    this.leagues.push(league);
                    resolve();
                });
            }).on('error', (err) => {
                console.log("Error: " + err.message);
                reject(err);
            });
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'FETCH_LEAGUES') {
            this.fetchLeagues(payload.urls);
        }
    }
});

/* Magic Mirror
 * Module: MMM-SvenskFotboll
 *
 * By Tommy Bandzaw, https://github.com/bandzaw/MMM-SvenskFotboll
 * Boost Software Licensed.
 */

Module.register('MMM-SvenskFotboll', {
    // Default module config.
    defaults: {
        urls: [
            'https://www.svenskfotboll.se/serier-cuper/tabell-och-resultat/allsvenskan-2024/115560/',
            /*'https://www.svenskfotboll.se/serier-cuper/tabell-och-resultat/div-3-mellersta-gotaland-herr-2024/115256/',*/
        ],
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.leagues) {
            for (var leagueIdx in this.leagues) {
                const league = this.leagues[leagueIdx];

                var div = wrapper.appendChild(document.createElement("div"));
                div.className = "league";

                var header = div.appendChild(document.createElement("h2"));
                header.innerHTML = league.name;

                var table = div.appendChild(document.createElement("table"));
                table.className = "league-table";
                
                for (var teamIdx in league.table) {
                    const team = league.table[teamIdx];
                    var row = table.appendChild(document.createElement("tr"));
                    var nameCell = row.appendChild(document.createElement("td"));
                    nameCell.className = "team";
                    nameCell.innerHTML = team.team;

                    var playedCell = row.appendChild(document.createElement("td"));
                    playedCell.className = "played";
                    playedCell.innerHTML = team.played;

                    var wonCell = row.appendChild(document.createElement("td"));
                    wonCell.className = "won";
                    wonCell.innerHTML = team.won;

                    var drawnCell = row.appendChild(document.createElement("td"));
                    drawnCell.className = "drawn";
                    drawnCell.innerHTML = team.drawn;

                    var lostCell = row.appendChild(document.createElement("td"));
                    lostCell.className = "lost";
                    lostCell.innerHTML = team.lost;

                    var goalsForCell = row.appendChild(document.createElement("td"));
                    goalsForCell.className = "goalsfor";
                    goalsForCell.innerHTML = team.goalsFor;

                    var goalsAgainstCell = row.appendChild(document.createElement("td"));
                    goalsAgainstCell.className = "goalsagainst";
                    goalsAgainstCell.innerHTML = team.goalsAgainst;

                    var goalDifferenceCell = row.appendChild(document.createElement("td"));
                    goalDifferenceCell.className = "goaldifference";
                    goalDifferenceCell.innerHTML = team.goalDifference;

                    var pointsCell = row.appendChild(document.createElement("td"));
                    pointsCell.className = "points";
                    pointsCell.innerHTML = team.points;
                }

                var upcomingGamesHeader = div.appendChild(document.createElement("h3"));
                upcomingGamesHeader.innerHTML = "Kommande matcher";

                var upcomingGamesTable = div.appendChild(document.createElement("table"));
                upcomingGamesTable.className = "upcoming-games";

                for (var gameIdx in league.upcomingGames) {
                    const game = league.upcomingGames[gameIdx];
                    var row = upcomingGamesTable.appendChild(document.createElement("tr"));
                    var homeTeamCell = row.appendChild(document.createElement("td"));
                    homeTeamCell.className = "home-team";
                    homeTeamCell.innerHTML = game.homeTeam;

                    var awayTeamCell = row.appendChild(document.createElement("td"));
                    awayTeamCell.className = "away-team";
                    awayTeamCell.innerHTML = game.awayTeam;

                    var dateTimeCell = row.appendChild(document.createElement("td"));
                    dateTimeCell.className = "date-time";
                    dateTimeCell.innerHTML = game.dateTime;

                    var locationCell = row.appendChild(document.createElement("td"));
                    locationCell.className = "location";
                    locationCell.innerHTML = game.location;
                }
            }
        } else {
            wrapper.innerHTML = 'Waiting for data...';
        }
    
        return wrapper;
    },

    // Override start method.
    start: function() {
        Log.info('Starting module: ' + this.name);
        this.leagues = [];
        this.data.header = "SvenskFotboll";
        this.sendSocketNotification('FETCH_LEAGUES', this.config);
    },

    getHeader: function() {
        return this.data.header;
    },
    
    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
        Log.info('Received socketNotification: ' + notification);
        if (notification === 'LEAGUES') {
            this.leagues = payload;
            this.updateDom();
        }
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === 'REFRESH_DATA') {
            this.leagues = null;
            this.updateDom();

            this.sendSocketNotification('FETCH_LEAGUES', this.config);
        }
    }
});

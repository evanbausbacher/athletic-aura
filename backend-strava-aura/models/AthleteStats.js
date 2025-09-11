const ActivityTotal = require('./ActivityTotal');

class AthleteStats{
    constructor(data){
        this.biggest_ride_distance = data.biggest_ride_distance;
        this.biggest_climb_elevation_gain = data.biggest_climb_elevation_gain;

        // Recent
        this.recent_ride_totals = new ActivityTotal(data.recent_ride_totals);
        this.recent_run_totals = new ActivityTotal(data.recent_run_totals);

        // YTD
        this.ytd_ride_totals = new ActivityTotal(data.ytd_ride_totals);
        this.ytd_run_totals = new ActivityTotal(data.ytd_run_totals);

        // All Time
        this.all_ride_totals = new ActivityTotal(data.all_ride_totals);
        this.all_run_totals = new ActivityTotal(data.all_run_totals);
    }
}

module.exports = AthleteStats;
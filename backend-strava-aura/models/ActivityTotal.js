class ActivityTotal{
    constructor(data){
        this.count = data.count;
        this.distance = data.distance;
        this.moving_time = data.moving_time;
        this.elapsed_time = data.elapsed_time;
        this.elevation_gain = data.elevation_gain;
        this.achievement_count = data.achievement_count;
    }
}

module.exports = ActivityTotal;
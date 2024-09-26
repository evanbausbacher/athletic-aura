import { IActivityTotal } from "./activity-total.model";

export interface IAthleteStats{
    biggest_ride_distance : number;
    biggest_climb_elevation_gain : number;

    recent_ride_totals : IActivityTotal;
    recent_run_totals : IActivityTotal;
    recent_swim_totals : IActivityTotal;

    ytd_ride_totals : IActivityTotal;
    ytd_run_totals : IActivityTotal;
    ytd_swim_totals : IActivityTotal;

    all_ride_totals : IActivityTotal;
    all_run_totals : IActivityTotal;
    all_swim_totals : IActivityTotal;
}
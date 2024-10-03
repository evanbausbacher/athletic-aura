import { Injectable } from '@angular/core';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';
import { IScore } from '../models/score.model';
import { IScoreCategory } from '../models/score-category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculateAuraService {

  // Strava Aura - an overall score evaluating an Athlete on Strava, based on a number of factors
  // Factors:
  // Profile Completeness : Has Bio / Has Profile Photo / Has City
  // Account Longevity : prioritize older account users
  // Multi sport athlete
  // Epic distances / climbs
  // Consistency
  // Social Stats
  constructor() { }

  profileScore : IScoreCategory | undefined;
  rideScore : IScoreCategory | undefined;
  runScore : IScoreCategory | undefined;
  swimScore : IScoreCategory | undefined;
  epicScore : IScoreCategory | undefined;
  
  generateScore(profile : IAthleteProfile, stats : IAthleteStats) : IScore{

    this.profileScore = this.calculateCompletenessScore(profile);
    this.rideScore = this.calculateRideScore(stats);
    this.runScore = this.calculateRunScore(stats);
    this.swimScore = this.calculateSwimScore(stats);
    this.epicScore = this.calculateEpicScore(stats);

    const scoreCategories : IScoreCategory[] = [
      this.profileScore,
      this.rideScore,
      this.runScore,
      this.swimScore,
      this.epicScore,
    ]

    const overallScore = this.calculateOverallScore();
    const overallGrade = this.calculateOverallGrade();
    const overallRating = this.calculateOverallRating();

    return {
      name: profile.firstname + " " + profile.lastname,
      profile_url : profile.profile,
      scores : scoreCategories,
      overallScore: overallScore,
      overallGrade: overallGrade,
      overallRating : overallRating,
    };
  }

  private calculateOverallScore() : number{
    return 0;
  }

  private calculateOverallGrade() : string{
    return "B";
  }

  private calculateOverallRating() : string{
    return "Nice";
  }

  private calculateCompletenessScore(profile : IAthleteProfile) : IScoreCategory{

    let score = 0;
    let perks : string[] = [];
    let index : number = 0;

    if (profile.summit){
      score += 10;
      perks[index] = "premium boi";
      index++;
    }

    if (profile.profile_medium){
      score += 10;
    }

    if (profile.bio){
      score += 10;
    }

    if (profile.city){
      score += 10;
    }

    if (profile.firstname == profile.firstname.toLowerCase()){
      score += 10;
      perks[index] = "artsy name";
      index++;
    }
    
    let coolStates : string[] = ['Texas', 'Florida', 'Colorado', 'Wisconsin', 'Utah', 'California'];
    if (coolStates.includes(profile.state)){
      score += 10;
      perks[index] = "baller state";
      index++;
    }

    if (profile.id < 5_000_000){
      if (profile.id < 1_000_000){
        score += 40;
        perks[index] = "prehistoric user";
        index++;
      }
      else{
        score += 30;
        perks[index] = "neanderthal user";
        index++;
      }
    }

    let rating : string;
    if (score >= 70){
      rating = "W Prof";
    }
    else if (score > 50){
      rating = "Mid Prof";
    }
    else{
      rating = "Down bad prof";
    }

    return {
      categoryName: "Profile Completeness",
      score: score,
      perks: perks,
      rating: rating
    };
  }

  private calculateSocialScore(profile : IAthleteProfile) : IScoreCategory{
    return {
      categoryName: "Social Score",
      score: 50,
      perks: ["big influencer ay"],
      rating: 'wow'
    };
  }

  private calculateRideScore(stats : IAthleteStats) : IScoreCategory {
    let score = 0;
    let perks : string[] = [];
    let index : number = 0;
    let rating : string = '';

    if (stats.recent_ride_totals.count >= 20){
      score += 20;
      perks[index] = "motivated swag";
      index++;
    }
    else if (stats.recent_ride_totals.count > 9){
      score += 10;
    }

    let ytdDistance = stats.ytd_ride_totals.distance / 1000;
    if (ytdDistance > 10_000){
      score += 20;
      perks[index] = "cycle daddy";
      index++;
    }

    let ytdVert = stats.ytd_ride_totals.elevation_gain;
    if (ytdVert > 100_000){
      score += 20;
      perks[index] = "nairoman";
      index++;
    }

    let totalHoursEver = stats.all_ride_totals.elapsed_time / 3600;
    if (totalHoursEver > 5000){
      if (totalHoursEver > 10_000){
        score += 40;
        perks[index] = "absolute master";
        index++;
      }
      else{
        score += 20;
        perks[index] = "extremely seasoned";
        index++;
      }
    }


    if (score > 69){
      rating = "Amstel 2019 MVDP";
    }
    else if (score >= 40){
      rating = "Podium Rider";
    }
    else if (score >= 10){
      rating = "Vibrant";
    }
    else{
      rating = "Couch Rider";
    }

    return {
      categoryName: "Cycling Score",
      score: score,
      perks: perks,
      rating: rating,
    };
  }

  private calculateRunScore(stats : IAthleteStats) : IScoreCategory {
    let score = 0;
    let perks : string[] = [];
    let index : number = 0;
    let rating : string = '';

    if (stats.recent_run_totals.count >= 20){
      score += 20;
      perks[index] = "build alert";
      index++;
    }
    else if (stats.recent_run_totals.count > 9){
      score += 10;
    }

    if (stats.ytd_run_totals.count > 10){
      score += 10;
    }

    let ytdDistance = stats.ytd_run_totals.distance / 1000;
    if (ytdDistance > 40_000){
      score += 20;
      perks[index] = "distance daddy";
      index++;
    }

    let ytdVert = stats.ytd_run_totals.elevation_gain;
    if (ytdVert > 50_000){
      score += 20;
      perks[index] = "alex honnold";
      index++;
    }

    let totalHoursEver = stats.all_run_totals.elapsed_time / 3600;
    if (totalHoursEver > 1000){
      if (totalHoursEver > 50_000){
        score += 40;
        perks[index] = "absolute master";
        index++;
      }
      else{
        score += 20;
        perks[index] = "extremely seasoned";
        index++;
      }
    }


    if (score > 69){
      rating = "Kipchoge";
    }
    else if (score >= 40){
      rating = "Enjoys Beer";
    }
    else if (score >= 10){
      rating = "Run Club Enthusiast";
    }
    else{
      rating = "Not a fan of punishment";
    }

    return {
      categoryName: "Running Score",
      score: score,
      perks: perks,
      rating: rating,
    };
  }

  private calculateSwimScore(stats : IAthleteStats) : IScoreCategory {
    let score = 0;
    let perks : string[] = [];
    let index : number = 0;
    let rating : string = '';

    if (stats.recent_swim_totals.count >= 20){
      score += 20;
      perks[index] = "build alert";
      index++;
    }
    else if (stats.recent_swim_totals.count > 9){
      score += 10;
    }

    if (stats.ytd_swim_totals.count > 10){
      score += 10;
    }

    let ytdDistance = stats.ytd_swim_totals.distance / 1000;
    if (ytdDistance > 10_000){
      score += 20;
      perks[index] = "fish";
      index++;
    }

    let totalHoursEver = stats.all_swim_totals.elapsed_time / 3600;
    if (totalHoursEver > 1000){
      if (totalHoursEver > 5000){
        score += 40;
        perks[index] = "absolute master";
        index++;
      }
      else{
        score += 20;
        perks[index] = "extremely seasoned";
        index++;
      }
    }


    if (score > 69){
      rating = "Phelps";
    }
    else if (score >= 40){
      rating = "Knows how to swim";
    }
    else{
      rating = "Beach guy";
    }

    return {
      categoryName: "Swimming Score",
      score: score,
      perks: perks,
      rating: rating,
    };
  }

  private calculateEpicScore(stats : IAthleteStats) : IScoreCategory {
    let score = 0;
    let perks : string[] = [];
    let index : number = 0;
    let rating : string = '';

    let distance = stats.biggest_ride_distance / 1000;
    let climb = stats.biggest_climb_elevation_gain;

    if (distance > 300){
      score += 50;
      perks[index] = "gargantuan ride";
      index++;
    }
    else if (distance > 200){
      score += 40;
      perks[index] = "mega ride";
      index++;
    }
    else if (distance > 161){
      score += 30;
      perks[index] = "century ride";
      index++;
    }

    if (climb > 3000){
      score += 50;
      perks[index] = "top 5 biggest climbs in world";
      index++;
    }
    else if (climb > 2000){
      score += 40;
      perks[index] = "hellacious climb";
      index++;
    }
    else if (climb > 1000){
      score += 30;
      perks[index] = "big climb";
      index++;
    }

    
    if (score >= 81){
      rating = "Monster";
    }
    else if (score >= 60){
      rating = "Epic";
    }
    else if (score >= 30){
      rating = "Sav";
    }
    else{
      rating = "Cruiser";
    }

    return {
      categoryName: "Epic Score",
      score: score,
      perks: perks,
      rating: rating,
    };
  }
}

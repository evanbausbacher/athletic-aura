import { Injectable } from '@angular/core';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';
import { IScore } from '../models/score.model';
import { IScoreCategory } from '../models/score-category.model';

@Injectable({
  providedIn: 'root',
})
export class CalculateAuraService {
  // Strava Aura - an overall score evaluating an Athlete on Strava, based on 4 categories:
  // 1. Profile Completeness : Has Bio / Has Profile Photo / Has City / Account Age
  // 2. Cycling Score : Recent activity, distance, elevation, total hours
  // 3. Running Score : Recent runs, distance, elevation, total hours  
  // 4. Epic Score : Biggest single ride distance and biggest climb

  profileScore: IScoreCategory | undefined;
  rideScore: IScoreCategory | undefined;
  runScore: IScoreCategory | undefined;
  epicScore: IScoreCategory | undefined;

  generateScore(profile: IAthleteProfile, stats: IAthleteStats): IScore {
    this.profileScore = this.calculateCompletenessScore(profile);
    this.rideScore = this.calculateRideScore(stats);
    this.runScore = this.calculateRunScore(stats);
    this.epicScore = this.calculateEpicScore(stats);

    const scoreCategories: IScoreCategory[] = [
      this.profileScore,
      this.rideScore,
      this.runScore,
      this.epicScore,
    ];

    const overallScore = this.calculateOverallScore();
    const overallGrade = this.calculateOverallGrade();
    const overallRating = this.calculateOverallRating();

    return {
      name: profile.firstname + ' ' + profile.lastname,
      profile_url: profile.profile,
      scores: scoreCategories,
      overallScore: overallScore,
      overallGrade: overallGrade,
      overallRating: overallRating,
    };
  }

  private calculateOverallScore(): number {
    if (!this.profileScore || !this.rideScore || !this.runScore || !this.epicScore) {
      return 0;
    }
    
    // Calculate weighted average (cycling and running weighted more heavily)
    const totalScore = (
      this.profileScore.score * 1.0 +
      this.rideScore.score * 1.5 +
      this.runScore.score * 1.5 +
      this.epicScore.score * 1.2
    );
    
    const totalWeight = 4 // 1.0 + 1.5 + 1.5 + 1.2; // = 5.2
    return Math.round(totalScore / totalWeight);
  }

  private calculateOverallGrade(): string {
    const score = this.calculateOverallScore();
    
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  private calculateOverallRating(): string {
    const score = this.calculateOverallScore();
    
    if (score >= 95) return 'Absolute Legend';
    if (score >= 90) return 'Elite Athlete';
    if (score >= 85) return 'Strava Superstar';
    if (score >= 80) return 'Epic Endurist';
    if (score >= 75) return 'Solid Performer';
    if (score >= 70) return 'Active Enthusiast';
    if (score >= 65) return 'Weekend Warrior';
    if (score >= 60) return 'Getting There';
    if (score >= 55) return 'Casual Movement Fan';
    if (score >= 50) return 'Beginner Plus';
    if (score >= 40) return 'Just Starting';
    return 'Couch Potato';
  }

  private calculateCompletenessScore(profile: IAthleteProfile): IScoreCategory {
    let score = 0;
    const perks: string[] = [];
    let index = 0;

    if (profile.summit) {
      score += 10;
      perks[index] = 'premium boi';
      index++;
    }

    if (profile.profile_medium) {
      score += 10;
    }
    else{
      perks[index] = 'too lazy to upload photo';
      index++;
    }

    if (profile.bio) {
      score += 10;
    }

    if (profile.city) {
      score += 10;
    }

    if (profile.firstname == profile.firstname.toLowerCase()) {
      score += 10;
      perks[index] = 'artsy name';
      index++;
    }

    const coolStates: string[] = ['Texas', 'Florida', 'Colorado', 'Utah', 'California'];
    if (coolStates.includes(profile.state)) {
      score += 10;
      perks[index] = 'baller state';
      index++;
    }

    if (profile.id < 5_000_000) {
      if (profile.id < 1_000_000) {
        score += 40;
        perks[index] = 'prehistoric user';
        index++;
      } else {
        score += 30;
        perks[index] = 'neanderthal user';
        index++;
      }
    }

    let rating: string;
    if (score >= 70) {
      rating = 'w rizz';
    } else if (score > 50) {
      rating = 'straight mid';
    } else {
      rating = 'attrocious prof';
    }

    return {
      categoryName: 'Profile Completeness',
      score: score,
      perks: perks,
      rating: rating,
    };
  }

  private calculateSocialScore(): IScoreCategory {
    return {
      categoryName: 'Social Score',
      score: 50,
      perks: ['big influencer ay'],
      rating: 'wow',
    };
  }

  private calculateRideScore(stats: IAthleteStats): IScoreCategory {
    let score = 0;
    const perks: string[] = [];
    let index = 0;
    let rating = '';

    if (stats.recent_ride_totals.count >= 20) {
      score += 20;
      perks[index] = 'motivated swag';
      index++;
    } else if (stats.recent_ride_totals.count > 9) {
      score += 10;
    }

    const ytdDistance = stats.ytd_ride_totals.distance / 1000;
    if (ytdDistance > 10_000) {
      score += 20;
      perks[index] = 'cycle daddy';
      index++;
    }

    const ytdVert = stats.ytd_ride_totals.elevation_gain;
    if (ytdVert > 100_000) {
      score += 20;
      perks[index] = 'nairoman';
      index++;
    }

    const totalHoursEver = stats.all_ride_totals.elapsed_time / 3600;
    if (totalHoursEver > 5000) {
      if (totalHoursEver > 10_000) {
        score += 40;
        perks[index] = 'absolute master';
        index++;
      } else {
        score += 20;
        perks[index] = 'extremely seasoned';
        index++;
      }
    }

    if (score > 69) {
      rating = 'Amstel 2019 MVDP';
    } else if (score >= 40) {
      rating = 'Podium Rider';
    } else if (score >= 10) {
      rating = 'Vibrant';
    } else {
      rating = 'Couch Rider';
    }

    return {
      categoryName: 'Cycling Score',
      score: score,
      perks: perks,
      rating: rating,
    };
  }

  private calculateRunScore(stats: IAthleteStats): IScoreCategory {
    let score = 0;
    const perks: string[] = [];
    let index = 0;
    let rating = '';

    if (stats.recent_run_totals.count >= 20) {
      score += 20;
      perks[index] = 'build alert';
      index++;
    } else if (stats.recent_run_totals.count > 9) {
      score += 10;
    }

    if (stats.ytd_run_totals.count > 10) {
      score += 10;
    }

    const ytdDistance = stats.ytd_run_totals.distance / 1000;
    if (ytdDistance > 40_000) {
      score += 20;
      perks[index] = 'distance daddy';
      index++;
    }

    const ytdVert = stats.ytd_run_totals.elevation_gain;
    if (ytdVert > 50_000) {
      score += 20;
      perks[index] = 'alex honnold';
      index++;
    }

    const totalHoursEver = stats.all_run_totals.elapsed_time / 3600;
    if (totalHoursEver > 1000) {
      if (totalHoursEver > 50_000) {
        score += 40;
        perks[index] = 'absolute master';
        index++;
      } else {
        score += 20;
        perks[index] = 'extremely seasoned';
        index++;
      }
    }

    if (score > 69) {
      rating = 'Kipchoge';
    } else if (score >= 40) {
      rating = 'Enjoys Beer';
    } else if (score >= 10) {
      rating = 'Run Club Enthusiast';
    } else {
      rating = 'Running was punishment in PE class';
    }

    return {
      categoryName: 'Running Score',
      score: score,
      perks: perks,
      rating: rating,
    };
  }


  private calculateEpicScore(stats: IAthleteStats): IScoreCategory {
    let score = 0;
    const perks: string[] = [];
    let index = 0;
    let rating = '';

    const distance = stats.biggest_ride_distance / 1000;
    const climb = stats.biggest_climb_elevation_gain;

    if (distance > 300) {
      score += 50;
      perks[index] = 'gargantuan ride';
      index++;
    } else if (distance > 200) {
      score += 40;
      perks[index] = 'mega ride';
      index++;
    } else if (distance > 161) {
      score += 30;
      perks[index] = 'century ride';
      index++;
    }

    if (climb > 3000) {
      score += 50;
      perks[index] = 'top 5 biggest climbs in world';
      index++;
    } else if (climb > 2000) {
      score += 40;
      perks[index] = 'hellacious climb';
      index++;
    } else if (climb > 1000) {
      score += 30;
      perks[index] = 'big climb';
      index++;
    }

    if (score >= 81) {
      rating = 'Monster';
    } else if (score >= 60) {
      rating = 'Epic';
    } else if (score >= 30) {
      rating = 'Sav';
    } else {
      rating = 'Cruiser';
    }

    return {
      categoryName: 'Epic Score',
      score: score,
      perks: perks,
      rating: rating,
    };
  }
}

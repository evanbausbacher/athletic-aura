import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';
import { IScore } from '../models/score.model';
import { CalculateAuraService } from '../services/calculate-aura.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  athleteProfile: IAthleteProfile | null = null;
  athleteStats: IAthleteStats | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private profileService: ProfileService,
    private scoreService: CalculateAuraService
  ) {}

  ngOnInit(): void {
    this.loadAthleteData();
  }

  private loadAthleteData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.athleteProfile = profile;
        console.log(profile);

        this.profileService.getStats(this.athleteProfile.id).subscribe({
          next: (stats) => {
            this.athleteStats = stats;
            const score: IScore = this.scoreService.generateScore(
              this.athleteProfile!,
              this.athleteStats
            );

            console.log(stats);
            console.log(score);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching stats:', error);
            this.errorMessage = 'Failed to load athlete statistics. Please try again.';
            this.isLoading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.errorMessage = 'Failed to load athlete profile. Please try again.';
        this.isLoading = false;
      },
    });
  }

  retryLoadData(): void {
    this.loadAthleteData();
  }

  getFullName(): string {
    if (this.athleteProfile) {
      return this.athleteProfile.firstname + ' ' + this.athleteProfile.lastname;
    } else {
      return '';
    }
  }
}

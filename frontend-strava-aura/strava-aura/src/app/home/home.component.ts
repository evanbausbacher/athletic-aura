import { Component, OnInit, inject } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';
import { IScore } from '../models/score.model';
import { CalculateAuraService } from '../services/calculate-aura.service';
import { ImageGenerationService, ShareableImageData } from '../services/image-generation.service';
import { fadeInAnimation, staggerAnimation, cardHoverAnimation, scoreRevealAnimation } from '../shared/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [fadeInAnimation, staggerAnimation, cardHoverAnimation, scoreRevealAnimation]
})
export class HomeComponent implements OnInit {
  athleteProfile: IAthleteProfile | null = null;
  athleteStats: IAthleteStats | null = null;
  auraScore: IScore | null = null;
  isLoading = true;
  errorMessage = '';

  private profileService = inject(ProfileService);
  private scoreService = inject(CalculateAuraService);
  private imageService = inject(ImageGenerationService);

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
            this.auraScore = this.scoreService.generateScore(
              this.athleteProfile!,
              this.athleteStats
            );

            console.log(stats);
            console.log(this.auraScore);
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

  getAccountAge(): string {
    if (this.athleteProfile?.created_at) {
      const createdDate = new Date(this.athleteProfile.created_at);
      return createdDate.getFullYear().toString();
    }
    return 'Unknown';
  }

  getTopCategoryScore(): number {
    if (!this.auraScore?.scores) return 0;
    return Math.max(...this.auraScore.scores.map(s => s.score));
  }

  getCategoryIcon(categoryName: string): string {
    const icons: Record<string, string> = {
      'Profile Completeness': '👤',
      'Cycling Score': '🚴',
      'Running Score': '🏃',
      'Epic Score': '⛰️'
    };
    return icons[categoryName] || '🏅';
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-strava-orange';
    if (score >= 60) return 'bg-yellow-400';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getScoreTextColor(score: number): string {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-strava-orange';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  }

  getScoreBadge(score: number): string {
    if (score >= 90) return '🏆 Legendary';
    if (score >= 80) return '🥇 Elite';
    if (score >= 70) return '🥈 Strong';
    if (score >= 60) return '🥉 Good';
    if (score >= 40) return '📈 Growing';
    return '🌱 Starting';
  }

  getTopCategories(count = 3): {name: string; score: number; rating: string; emoji: string}[] {
    if (!this.auraScore?.scores) return [];
    
    return this.auraScore.scores
      .map(score => ({
        name: score.categoryName,
        score: score.score,
        rating: score.rating,
        emoji: this.getCategoryIcon(score.categoryName)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  getRandomPerks(count = 3): string[] {
    if (!this.auraScore?.scores) return [];
    
    const allPerks: string[] = [];
    this.auraScore.scores.forEach(score => {
      if (score.perks && score.perks.length > 0) {
        allPerks.push(...score.perks);
      }
    });
    
    // Shuffle array and return random perks
    const shuffled = allPerks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async shareMyScore(): Promise<void> {
    if (!this.athleteProfile || !this.auraScore) {
      console.warn('Cannot share: missing profile or score data');
      return;
    }

    const shareData: ShareableImageData = {
      overallScore: this.auraScore.overallScore,
      grade: this.auraScore.overallGrade,
      rating: this.auraScore.overallRating,
      topCategories: this.getTopCategories(3),
      randomPerks: this.getRandomPerks(3),
      profileImage: this.athleteProfile.profile || '',
      userName: this.getFullName()
    };

    try {
      const imageDataUrl = await this.imageService.generateShareImage(shareData);
      
      const sharePayload = {
        title: 'My Strava Aura Score',
        text: `Check out my Strava Aura score: ${this.auraScore.overallScore} (${this.auraScore.overallGrade})! 🏆`,
        url: window.location.origin
      };

      await this.imageService.shareImage(imageDataUrl, sharePayload);
    } catch (error) {
      console.error('Error sharing score:', error);
    }
  }

}

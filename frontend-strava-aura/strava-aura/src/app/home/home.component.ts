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
  showImprovementTips = false;
  improvementTips: {category: string, tips: string[], currentScore: number}[] = [];

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

            // Cache improvement tips once score is calculated
            this.generateImprovementTips();

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

  toggleImprovementTips(): void {
    this.showImprovementTips = !this.showImprovementTips;
  }

  private generateImprovementTips(): void {
    if (!this.auraScore?.scores) {
      this.improvementTips = [];
      return;
    }

    this.improvementTips = this.auraScore.scores.map(category => ({
      category: category.categoryName,
      currentScore: category.score,
      tips: this.generateTipsForCategory(category.categoryName, category.score)
    }));
  }

  private generateTipsForCategory(categoryName: string, currentScore: number): string[] {
    const tips: string[] = [];

    switch (categoryName) {
      case 'Profile Completeness':
        if (currentScore < 100) {
          if (!this.athleteProfile?.summit) {
            tips.push('💎 Upgrade to Strava Premium for premium features and support');
          }
          if (!this.athleteProfile?.profile_medium) {
            tips.push('📸 Add a profile photo to personalize your account');
          }
          if (!this.athleteProfile?.bio) {
            tips.push('✏️ Write a bio to tell your story and connect with other athletes');
          }
          if (!this.athleteProfile?.city) {
            tips.push('📍 Add your location to find local athletes and segments');
          }
          if (this.athleteProfile?.firstname !== this.athleteProfile?.firstname.toLowerCase()) {
            tips.push('🎨 Consider using a lowercase name for that "artsy" vibe');
          }
        }
        if (tips.length === 0) {
          tips.push('🏆 Your profile is already optimized! Keep being awesome.');
        }
        break;

      case 'Cycling Score':
        if (currentScore < 20) {
          tips.push('🚴‍♂️ Start with 3-4 rides per month to build consistency');
          tips.push('🎯 Aim for 50km+ rides to build endurance');
          tips.push('📱 Use Strava to track all your cycling activities');
        } else if (currentScore < 40) {
          tips.push('🔥 Increase to 10+ rides per month for "motivated swag"');
          tips.push('🛣️ Target 5,000km+ per year to show serious commitment');
          tips.push('⛰️ Include more climbing - aim for 50,000m elevation per year');
        } else if (currentScore < 60) {
          tips.push('🏔️ Push for 100,000m+ elevation gain per year to earn "nairoman" status');
          tips.push('🚀 Aim for 10,000km+ yearly distance to become a "cycle daddy"');
          tips.push('⏱️ Build up to 5,000+ total hours for "extremely seasoned" recognition');
        } else if (currentScore < 80) {
          tips.push('🎯 Target 20+ rides per month consistently');
          tips.push('🏆 Push towards 10,000+ total cycling hours for "absolute master" status');
          tips.push('💪 Focus on big climbing days and century rides');
        } else {
          tips.push('🚴‍♂️ You\'re already crushing it! Keep logging those epic rides');
          tips.push('🏆 Consider coaching others or joining competitive events');
        }
        break;

      case 'Running Score':
        if (currentScore < 20) {
          tips.push('🏃‍♂️ Start with 3-4 runs per month to build a routine');
          tips.push('👟 Focus on consistency over distance initially');
          tips.push('📱 Log all your runs to track progress');
        } else if (currentScore < 40) {
          tips.push('🔥 Aim for 10+ runs per month to earn "build alert" status');
          tips.push('🛣️ Target 20,000km+ per year for serious distance');
          tips.push('⛰️ Add hill training - aim for 25,000m elevation per year');
        } else if (currentScore < 60) {
          tips.push('🏔️ Push for 50,000m+ elevation gain per year for "alex honnold" status');
          tips.push('🚀 Aim for 40,000km+ yearly distance to become a "distance daddy"');
          tips.push('⏱️ Build up to 1,000+ total hours of running');
        } else if (currentScore < 80) {
          tips.push('🎯 Maintain 20+ runs per month consistently');
          tips.push('🏆 Work towards ultra-marathon distances and trail running');
          tips.push('💪 Focus on vertical challenges and mountain running');
        } else {
          tips.push('🏃‍♂️ You\'re running like Kipchoge! Keep setting the pace');
          tips.push('🏆 Consider marathon coaching or competitive trail running');
        }
        break;

      case 'Epic Score':
        if (currentScore < 30) {
          tips.push('🎯 Train for a 161km+ century ride to unlock your first epic achievement');
          tips.push('🏔️ Find a 1,000m+ climb challenge in your area');
          tips.push('📈 Gradually build your longest ride distance each month');
        } else if (currentScore < 60) {
          tips.push('🚀 Push for a 200km+ "mega ride" to level up');
          tips.push('⛰️ Tackle a 2,000m+ "hellacious climb" for serious elevation');
          tips.push('🗺️ Plan multi-day touring or bikepacking adventures');
        } else if (currentScore < 80) {
          tips.push('💪 Challenge yourself with a 300km+ "gargantuan ride"');
          tips.push('🏔️ Seek out 3,000m+ climbs - the "top 5 biggest climbs in world"');
          tips.push('🎯 Combine epic distance with epic elevation in single rides');
        } else {
          tips.push('👑 You\'re already epic! Share your adventures to inspire others');
          tips.push('🏆 Consider attempting famous climbs: Alpe d\'Huez, Mount Washington, etc.');
        }
        break;
    }

    return tips;
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
      profileImage: this.athleteProfile.profile_medium || this.athleteProfile.profile || '',
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

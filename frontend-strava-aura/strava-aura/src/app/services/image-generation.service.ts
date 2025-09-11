import { Injectable } from '@angular/core';

export interface ShareableImageData {
  overallScore: number;
  grade: string;
  rating: string;
  topCategories: {
    name: string;
    score: number;
    rating: string;
    emoji: string;
  }[];
  randomPerks: string[];
  profileImage: string;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageGenerationService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // Instagram Story dimensions
  private readonly WIDTH = 1080;
  private readonly HEIGHT = 1920;
  
  // Brand colors (matching Tailwind config)
  private readonly COLORS = {
    primary: '#FC4C02', // Strava orange
    background: '#1a1a1a', // Dark background
    secondary: '#2d2d2d', // Secondary gray
    text: '#ffffff',
    accent: '#22c55e', // Success green
    cardBg: '#f8fafc' // Light card background
  };

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateShareImage(data: ShareableImageData): Promise<string> {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    
    // Draw background
    await this.drawBackground();
    
    // Draw Strava Aura logo
    await this.drawLogo();
    
    // Draw user profile image
    await this.drawProfileImage(data.profileImage);
    
    // Draw user name
    this.drawUserName(data.userName);
    
    // Draw overall score section
    this.drawOverallScore(data.overallScore, data.grade, data.rating);
    
    // Draw top 3 categories
    this.drawTopCategories(data.topCategories);
    
    // Draw random perks
    this.drawRandomPerks(data.randomPerks);
    
    // Draw footer text
    this.drawFooter();
    
    return this.canvas.toDataURL('image/png', 1.0);
  }

  private async drawBackground(): Promise<void> {
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.HEIGHT);
    gradient.addColorStop(0, this.COLORS.primary);
    gradient.addColorStop(0.7, '#8B5A2B'); // Darker orange-brown
    gradient.addColorStop(1, this.COLORS.background);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    
    // Add subtle texture overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.WIDTH;
      const y = Math.random() * this.HEIGHT;
      const size = Math.random() * 3;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  private async drawLogo(): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Draw logo in top center
        const logoSize = 120;
        const x = (this.WIDTH - logoSize) / 2;
        const y = 80;
        
        this.ctx.drawImage(img, x, y, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => resolve(); // Continue even if logo fails to load
      img.src = 'assets/logo.png';
    });
  }

  private async drawProfileImage(profileImageUrl: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS for external images
      img.onload = () => {
        // Draw circular profile image
        const size = 180;
        const x = (this.WIDTH - size) / 2;
        const y = 240;
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.clip();
        
        this.ctx.drawImage(img, x, y, size, size);
        this.ctx.restore();
        
        // Add border around profile image
        this.ctx.strokeStyle = this.COLORS.text;
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2 + 3, 0, Math.PI * 2);
        this.ctx.stroke();
        
        resolve();
      };
      img.onerror = () => {
        // Draw placeholder circle if image fails
        const size = 180;
        const x = (this.WIDTH - size) / 2;
        const y = 240;
        
        this.ctx.fillStyle = this.COLORS.secondary;
        this.ctx.beginPath();
        this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = this.COLORS.text;
        this.ctx.font = 'bold 60px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('👤', x + size/2, y + size/2 + 20);
        
        resolve();
      };
      img.src = profileImageUrl;
    });
  }

  private drawUserName(userName: string): void {
    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 48px Lobster';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(userName, this.WIDTH / 2, 480);
  }

  private drawOverallScore(score: number, grade: string, rating: string): void {
    const centerX = this.WIDTH / 2;
    let y = 580;
    
    // "My Aura Score" title
    // this.ctx.fillStyle = this.COLORS.text;
    // this.ctx.font = 'bold 36px Inter';
    // this.ctx.textAlign = 'center';
    // this.ctx.fillText('My Aura Score', centerX, y);
    y += 80;
    
    // Large score number
    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 120px Lobster';
    this.ctx.fillText(score.toString(), centerX, y);
    y += 80;
    
    // Grade and rating
    this.ctx.fillStyle = this.COLORS.accent;
    this.ctx.font = 'bold 54px Lobster';
    this.ctx.fillText(`${grade} • ${rating}`, centerX, y);
  }

  private drawTopCategories(categories: {name: string; score: number; rating: string; emoji: string}[]): void {
    const startY = 820;
    const cardHeight = 120;
    const cardSpacing = 140;
    const cardWidth = 900;
    const startX = (this.WIDTH - cardWidth) / 2;
    
    // Title
    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 42px Inter';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Top Skills', this.WIDTH / 2, startY);
    
    categories.forEach((category, index) => {
      const y = startY + 60 + (index * cardSpacing);
      
      // Card background
      this.ctx.fillStyle = this.COLORS.cardBg;
      this.ctx.fillRect(startX, y, cardWidth, cardHeight);
      
      // Category emoji and name
      this.ctx.fillStyle = this.COLORS.background;
      this.ctx.font = 'bold 32px Inter';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${category.emoji} ${category.name}`, startX + 30, y + 45);
      
      // Score and rating
      this.ctx.font = 'bold 36px Lobster';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${category.score} • ${category.rating}`, startX + cardWidth - 30, y + 45);
      
      // Progress bar
      const barWidth = cardWidth - 60;
      const barHeight = 8;
      const barY = y + 70;
      
      // Background bar
      this.ctx.fillStyle = this.COLORS.secondary;
      this.ctx.fillRect(startX + 30, barY, barWidth, barHeight);
      
      // Progress bar
      const progress = category.score / 100;
      this.ctx.fillStyle = this.COLORS.primary;
      this.ctx.fillRect(startX + 30, barY, barWidth * progress, barHeight);
    });
  }

  private drawRandomPerks(perks: string[]): void {
    const startY = 1400;
    
    // Title
    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 42px Inter';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Recent Achievements', this.WIDTH / 2, startY);
    
    // Perks
    perks.forEach((perk, index) => {
      const y = startY + 60 + (index * 50);
      
      this.ctx.fillStyle = this.COLORS.accent;
      this.ctx.font = '32px Inter';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`🏆 ${perk}`, this.WIDTH / 2, y);
    });
  }

  private drawFooter(): void {
    const y = this.HEIGHT - 120;
    
    // App name
    this.ctx.fillStyle = this.COLORS.text;
    this.ctx.font = 'bold 36px Lobster';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Strava Aura', this.WIDTH / 2, y);
    
    // Tagline
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '24px Inter';
    this.ctx.fillText('What\'s your aura?', this.WIDTH / 2, y + 40);
  }

  async downloadImage(dataUrl: string, fileName = 'my-strava-aura.png'): Promise<void> {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async shareImage(dataUrl: string, shareData: {title: string; text: string; url: string}): Promise<void> {
    // Check if Web Share API is available and supports files
    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'my-strava-aura.png', { type: 'image/png' });
        
        const sharePayload = {
          ...shareData,
          files: [file]
        };
        
        // Check if browser supports sharing files
        if (navigator.canShare && navigator.canShare(sharePayload)) {
          await navigator.share(sharePayload);
          return;
        } else if (navigator.share) {
          // Fallback to basic share without file
          await navigator.share(shareData);
          return;
        }
      } catch (error) {
        console.warn('Native sharing failed, trying fallback methods:', error);
      }
    }
    
    // Enhanced fallbacks for different platforms
    if (this.isMobile()) {
      // Mobile fallback: try to copy share text and download image
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
          await navigator.clipboard.writeText(shareText);
        }
        await this.downloadImage(dataUrl);
        
        // Show user feedback
        this.showShareFeedback('Image downloaded! Share text copied to clipboard.');
      } catch {
        await this.downloadImage(dataUrl);
        this.showShareFeedback('Image downloaded! Copy this text to share: ' + shareData.text);
      }
    } else {
      // Desktop fallback: download image and show share options
      await this.downloadImage(dataUrl);
      this.showShareFeedback('Image downloaded! Share it on your favorite platform.');
    }
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private showShareFeedback(message: string): void {
    // Simple toast notification for user feedback
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #FC4C02;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: Inter, sans-serif;
      font-weight: 600;
      z-index: 10000;
      max-width: 90vw;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }
}
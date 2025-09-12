import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { IScore } from '../models/score.model';
import { IAthleteProfile } from '../models/athlete-profile.model';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  
  private readonly defaultSEO: SEOData = {
    title: 'Strava Aura - Your Athletic Aura Score | Gamified Fitness Analytics',
    description: 'Discover your Strava Aura score - a comprehensive gamified rating system analyzing your cycling, running, profile completeness, and epic achievements. Connect with Strava to get your personalized athletic aura rating.',
    keywords: 'Strava, aura score, cycling analytics, running stats, fitness tracking, athletic performance, Strava analysis, sports data visualization, gamified fitness',
    image: 'https://strava-aura.app/og-image-strava.png',
    url: 'https://strava-aura.app',
    type: 'website'
  };

  updateSEO(data: Partial<SEOData>): void {
    const seoData = { ...this.defaultSEO, ...data };
    
    // Update title
    if (seoData.title) {
      this.titleService.setTitle(seoData.title);
    }
    
    // Update meta tags
    this.updateMetaTag('description', seoData.description);
    this.updateMetaTag('keywords', seoData.keywords);
    
    // Update Open Graph tags
    this.updateMetaProperty('og:title', seoData.title);
    this.updateMetaProperty('og:description', seoData.description);
    this.updateMetaProperty('og:image', seoData.image);
    this.updateMetaProperty('og:url', seoData.url);
    this.updateMetaProperty('og:type', seoData.type);
    
    // Update Twitter Card tags
    this.updateMetaTag('twitter:title', seoData.title);
    this.updateMetaTag('twitter:description', seoData.description);
    this.updateMetaTag('twitter:image', seoData.image);
    
    // Update canonical URL
    this.updateCanonicalUrl(seoData.url || this.defaultSEO.url!);
  }

  updateForUserScore(athleteProfile: IAthleteProfile, auraScore: IScore): void {
    const userName = `${athleteProfile.firstname} ${athleteProfile.lastname}`;
    const score = auraScore.overallScore;
    const grade = auraScore.overallGrade;
    const rating = auraScore.overallRating;
    
    const customSEO: SEOData = {
      title: `${userName}'s Strava Aura: ${score} (${grade}) - ${rating} | Athletic Performance Analytics`,
      description: `${userName} achieved a Strava Aura score of ${score} with grade ${grade} - ${rating}. Analyze cycling, running, profile completeness, and epic achievements with personalized improvement tips.`,
      keywords: `${userName}, Strava aura, ${score} score, ${grade} grade, ${rating}, cycling analytics, running stats, athletic performance`,
      url: 'https://strava-aura.app/aura',
      type: 'profile'
    };
    
    this.updateSEO(customSEO);
  }

  resetToDefault(): void {
    this.updateSEO(this.defaultSEO);
  }

  generateStructuredData(athleteProfile: IAthleteProfile, auraScore: IScore): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": `${athleteProfile.firstname} ${athleteProfile.lastname}`,
      "url": `https://strava-aura.app/aura`,
      "image": athleteProfile.profile_medium || athleteProfile.profile,
      "description": `Athletic performance profile with Strava Aura score of ${auraScore.overallScore}`,
      "knowsAbout": [
        "Cycling",
        "Running",
        "Athletic Performance",
        "Fitness Training"
      ],
      "hasOccupation": {
        "@type": "Thing",
        "name": "Athlete"
      },
      "memberOf": {
        "@type": "SportsOrganization",
        "name": "Strava",
        "url": "https://www.strava.com"
      },
      "award": [
        `Strava Aura Score: ${auraScore.overallScore}`,
        `Athletic Grade: ${auraScore.overallGrade}`,
        `Performance Rating: ${auraScore.overallRating}`
      ]
    };
    
    return JSON.stringify(structuredData);
  }

  private updateMetaTag(name: string, content?: string): void {
    if (!content) return;
    
    if (this.metaService.getTag(`name="${name}"`)) {
      this.metaService.updateTag({ name, content });
    } else {
      this.metaService.addTag({ name, content });
    }
  }

  private updateMetaProperty(property: string, content?: string): void {
    if (!content) return;
    
    if (this.metaService.getTag(`property="${property}"`)) {
      this.metaService.updateTag({ property, content });
    } else {
      this.metaService.addTag({ property, content });
    }
  }

  private updateCanonicalUrl(url: string): void {
    let link = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      document.head.appendChild(link);
    }
  }

  addStructuredDataScript(jsonLd: string, id = 'structured-data-person'): void {
    // Remove existing structured data script if exists
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.innerHTML = jsonLd;
    document.head.appendChild(script);
  }

  removeStructuredDataScript(id = 'structured-data-person'): void {
    const script = document.getElementById(id);
    if (script) {
      script.remove();
    }
  }
}
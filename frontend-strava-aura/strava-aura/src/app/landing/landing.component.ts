import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent implements OnInit {
  hasToken = false;

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    // Ensure default SEO is set for the landing page
    this.seoService.resetToDefault();

    // Check if user is already authenticated and redirect if so
    if (this.authService.isAuthenticated()) {
      console.log('User already authenticated, redirecting to aura page');
      this.router.navigate(['/aura']);
    }
  }

  // Trigger Strava OAuth2 authentication
  authenticateWithStrava() {
    this.authService.redirectToStravaAuth();
  }
}

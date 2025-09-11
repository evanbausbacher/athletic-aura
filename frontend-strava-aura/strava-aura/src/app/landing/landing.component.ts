import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  hasToken = false;

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Trigger Strava OAuth2 authentication
  authenticateWithStrava() {
    this.authService.redirectToStravaAuth();
  }
}

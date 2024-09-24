import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  hasToken : boolean = false;

  constructor(
    private authService : AuthService, 
    private route : ActivatedRoute,
    private router : Router
  ) { }

  ngOnInit(): void {

  }

  // Trigger Strava OAuth2 authentication
  authenticateWithStrava(){
    this.authService.redirectToStravaAuth();
  }
}

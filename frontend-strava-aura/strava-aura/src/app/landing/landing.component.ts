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
    
    // Check for Authorization code in the URL
    this.route.queryParams.subscribe(params => {
      const accessToken = params['access_token'];

      if (accessToken){
        console.log("Got access Token");
        this.hasToken = true;
        localStorage.setItem('access_token', accessToken);
        this.router.navigate(['/aura']);
      }

    });
  }

  // Trigger Strava OAuth2 authentication
  authenticateWithStrava(){
    this.authService.redirectToStravaAuth();
  }
}

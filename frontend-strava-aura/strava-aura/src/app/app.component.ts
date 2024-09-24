import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'strava-aura';

  message : any

  constructor(private authService : AuthService) { }

  ngOnInit(): void {
    this.authService.getHello().subscribe(data => {
      this.message = data;
    });
  }
}

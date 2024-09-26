import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  athleteProfile : IAthleteProfile | null = null;
  athleteStats : IAthleteStats | null = null;

  constructor(
    private profileService : ProfileService
  ){}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe(profile => {
      this.athleteProfile = profile;
      console.log(profile);

      this.profileService.getStats(this.athleteProfile.id).subscribe(stats => {
        this.athleteStats = stats;
        console.log(stats);
      })
    });
  }


  getFullName() : string{
    if (this.athleteProfile){
      return this.athleteProfile.firstname + " " + this.athleteProfile.lastname;
    }
    else{
      return ""
    }
  }
}

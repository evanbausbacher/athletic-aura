import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAthleteProfile } from '../models/athlete-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http : HttpClient) { }

  getProfile() : Observable<IAthleteProfile> {
    return this.http.get<IAthleteProfile>('/api/profile');
  }
}

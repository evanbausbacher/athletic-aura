import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(): Observable<IAthleteProfile> {
    return this.http.get<IAthleteProfile>('/api/profile');
  }

  getStats(profileId: number): Observable<IAthleteStats> {
    return this.http.get<IAthleteStats>(`/api/stats/${profileId}`);
  }
}

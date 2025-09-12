import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(): Observable<IAthleteProfile> {
    return this.http.get<IAthleteProfile>(`${environment.apiUrl}/api/profile`, {
      withCredentials: true
    });
  }

  getStats(profileId: number): Observable<IAthleteStats> {
    return this.http.get<IAthleteStats>(`${environment.apiUrl}/api/stats/${profileId}`, {
      withCredentials: true
    });
  }
}

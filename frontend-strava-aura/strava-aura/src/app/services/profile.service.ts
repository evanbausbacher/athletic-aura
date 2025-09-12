import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { IAthleteProfile } from '../models/athlete-profile.model';
import { IAthleteStats } from '../models/athlete-stats.model';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  getProfile(): Observable<IAthleteProfile> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers => 
        this.http.get<IAthleteProfile>(`${environment.apiUrl}/api/profile`, { headers })
      )
    );
  }

  getStats(profileId: number): Observable<IAthleteStats> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.get<IAthleteStats>(`${environment.apiUrl}/api/stats/${profileId}`, { headers })
      )
    );
  }

  private async getAuthHeaders(): Promise<HttpHeaders> {
    try {
      const token = await this.tokenService.getValidAccessToken();
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    } catch {
      throw new Error('Authentication required. Please re-authenticate.');
    }
  }
}

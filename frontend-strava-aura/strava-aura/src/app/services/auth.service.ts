import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  getHello() {
    return this.http.get(`${environment.apiUrl}/api/hello`, {
      withCredentials: true
    });
  }

  redirectToStravaAuth() {
    window.location.href = `${environment.apiUrl}/auth/strava`;
  }

  getAccessToken(code: string): Observable<unknown> {
    return this.http.get(`${environment.apiUrl}/api/auth/callback?code=${code}`, {
      withCredentials: true
    });
  }
}

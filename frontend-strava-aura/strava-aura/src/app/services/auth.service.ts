import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = '/api';
  backendUrl = 'http://localhost:3000';

  private http = inject(HttpClient);

  getHello() {
    return this.http.get(this.apiUrl + '/hello');
  }

  redirectToStravaAuth() {
    window.location.href = `${this.backendUrl}/auth/strava`;
  }

  getAccessToken(code: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/auth/callback?code=${code}`);
  }
}

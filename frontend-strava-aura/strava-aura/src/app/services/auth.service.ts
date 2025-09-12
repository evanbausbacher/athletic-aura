import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  getHello() {
    return this.http.get(`${environment.apiUrl}/api/hello`);
  }

  redirectToStravaAuth() {
    window.location.href = `${environment.apiUrl}/auth/strava`;
  }

  handleAuthCallback(): boolean {
    const tokens = this.tokenService.parseTokensFromUrl();
    if (tokens) {
      this.tokenService.storeTokens(tokens);
      this.tokenService.clearTokensFromUrl();
      return true;
    }
    return false;
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidTokens();
  }

  logout(): void {
    this.tokenService.clearTokens();
  }
}

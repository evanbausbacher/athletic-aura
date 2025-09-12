import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'strava_access_token';
  private readonly REFRESH_TOKEN_KEY = 'strava_refresh_token';
  private readonly EXPIRES_AT_KEY = 'strava_expires_at';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidTokens());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private http = inject(HttpClient);

  storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expires_at.toString());
    this.isAuthenticatedSubject.next(true);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const expiresAt = this.getExpiresAt();
    
    if (!accessToken || !expiresAt) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const isExpired = Date.now() >= (expiresAt * 1000) - bufferTime;
    
    return !isExpired;
  }

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.http.post<AuthTokens>(
      `${environment.apiUrl}/api/auth/refresh`,
      { refresh_token: refreshToken }
    ).toPromise();

    if (response) {
      this.storeTokens(response);
      return response;
    }

    throw new Error('Failed to refresh tokens');
  }

  async getValidAccessToken(): Promise<string> {
    if (this.hasValidTokens()) {
      return this.getAccessToken()!;
    }

    // Try to refresh the token
    try {
      const tokens = await this.refreshTokens();
      return tokens.access_token;
    } catch {
      this.clearTokens();
      throw new Error('Authentication required. Please re-authenticate.');
    }
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  parseTokensFromUrl(): AuthTokens | null {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const expiresAt = urlParams.get('expires_at');

    if (accessToken && refreshToken && expiresAt) {
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: parseInt(expiresAt, 10)
      };
    }

    return null;
  }

  clearTokensFromUrl(): void {
    // Remove token parameters from URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('expires_at');
    
    window.history.replaceState({}, document.title, url.toString());
  }
}
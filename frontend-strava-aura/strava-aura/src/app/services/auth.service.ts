import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  apiUrl = '/api';
  backendUrl = 'http://localhost:3000';

  constructor(private http : HttpClient) { }

  getHello(){
    return this.http.get(this.apiUrl + '/hello');
  }

  redirectToStravaAuth(){
    window.location.href = `${this.backendUrl}/auth/strava`;
  }

  getAccessToken(code : string) : Observable<any>{
    return this.http.get(`${this.apiUrl}/auth/callback?code=${code}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  apiUrl = '/api';

  constructor(private http : HttpClient) { }

  getHello(){
    return this.http.get(this.apiUrl + '/hello');
  }
}

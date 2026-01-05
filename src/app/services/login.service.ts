import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Login } from '../../interfaces/login';
import { ApiResponse } from '../../interfaces/ApiResponse';
import { Observable } from 'rxjs';
import { Sesion } from '../../interfaces/sesion';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  
 baseUrl:string = environment.apiUrl + "Login";
  constructor(private http: HttpClient) { }

  iniciarSession(request: Login): Observable<ApiResponse<Sesion>> 
  {const url = `${this.baseUrl}/IniciarSesion`;
    return this.http.post<ApiResponse<Sesion>>(url, request);
  }
  
}


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login } from '../../interfaces/login';
import { Sesion } from '../../interfaces/sesion';
import { Registro } from '../models/registro.model';
import { ApiResponse } from '../../interfaces/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly baseUrl = `${environment.apiUrl}Usuario/`;

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN → el backend devuelve Sesion DIRECTAMENTE
  iniciarSesion(request: Login): Observable<Sesion> {
    return this.http.post<Sesion>(
      `${this.baseUrl}login`,
      request
    );
  }

  // 📝 REGISTRO → aquí sí puedes usar ApiResponse si el backend lo hace
  registrar(request: Registro): Observable<ApiResponse<Sesion>> {
    return this.http.post<ApiResponse<Sesion>>(
      `${this.baseUrl}registro`,
      request
    );
  }

  lista(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.baseUrl);
  }

  listadoRoles(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}listadoRoles`
    );
  }
}

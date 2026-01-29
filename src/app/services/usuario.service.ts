
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

  // ⚠️ Coincide EXACTAMENTE con Swagger: /api/Usuario
  private readonly baseUrl = `${environment.apiUrl}Usuario/`;

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN → POST /api/Usuario/login
  iniciarSesion(request: Login): Observable<Sesion> {
    return this.http.post<Sesion>(
      `${this.baseUrl}login`,
      request
    );
  }

  // 📝 REGISTRO → POST /api/Usuario/registro
  registrar(request: Registro): Observable<Sesion> {
    return this.http.post<Sesion>(
      `${this.baseUrl}registro`,
      request
    );
  }

  // 📋 LISTAR USUARIOS → GET /api/Usuario (requiere token)
  lista(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }
  listadoRoles(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}listadoRoles`
    );
  }
}

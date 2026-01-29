import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Devocional } from '../models/devocional.model';
import { DevocionalCancionDetalle } from '../models/devocional-cancion-detalle.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevocionalService {

  private readonly apiUrl = `${environment.apiUrl}Devocional`;

  constructor(private http: HttpClient) {}

  // ============================
  // GET: todos los devocionales
  // ============================
  obtenerTodos(): Observable<Devocional[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.resultado ?? [])
    );
  }

  // ============================
  // GET: devocional por id
  // ============================
  obtenerPorId(id: number): Observable<Devocional> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.resultado as Devocional)
    );
  }

  // ============================
  // POST: crear devocional
  // ============================
  crear(nombreDevocional: string): Observable<Devocional> {
    return this.http.post<any>(this.apiUrl, { nombreDevocional }).pipe(
      map(res => res.resultado)
    );
  }

  // ============================
  // PUT: editar devocional
  // ============================
  actualizar(devocional: Devocional): Observable<void> {
    return this.http.put<void>(this.apiUrl, devocional);
  }

  // ============================
  // DELETE: eliminar devocional
  // ============================
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============================
  // POST: agregar canciones
  // ============================
  agregarCanciones(
    devocionalId: number,
    cancionIds: number[]
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/agregar-canciones`,
      { devocionalId, cancionIds }
    );
  }

  // ============================
  // GET: canciones del devocional
  // ============================
  obtenerCanciones(
    devocionalId: number
  ): Observable<DevocionalCancionDetalle[]> {
    return this.http.get<any>(
      `${this.apiUrl}/${devocionalId}/canciones`
    ).pipe(
      map(res => res.resultado ?? [])
    );
  }

  // ============================
  // PUT: reordenar canciones
  // ============================
  reordenarCanciones(
    devocionalId: number,
    canciones: { cancionId: number; posicionCancion: number }[]
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${devocionalId}/reordenar-canciones`,
      canciones
    );
  }

  // ============================
  // DELETE: eliminar canción del devocional
  // ============================
  eliminarCancion(
    devocionalId: number,
    cancionId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${devocionalId}/canciones/${cancionId}`
    );
  }
}

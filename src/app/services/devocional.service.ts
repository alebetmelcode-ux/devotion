import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devocional } from '../models/devocional.model';

@Injectable({
  providedIn: 'root'
})
export class DevocionalService {
  addSongToDevocional(arg0: { id: number; 'id-devocional': number; 'id-cancion': number; 'posicion-cancion': number; 'acordes-finales': any; }) {
    throw new Error('Method not implemented.');
  }
  addDevocional(arg0: { id: number; titulo: any; }) {
    throw new Error('Method not implemented.');
  }
  getDevocionalById(devocionalId: number): Observable<Devocional | undefined> {
    throw new Error('Method not implemented.');
  }

  private readonly apiUrl = 'http://localhost:5138/api/Devocional';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Devocional[]> {
    return this.http.get<Devocional[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Devocional> {
    return this.http.get<Devocional>(`${this.apiUrl}/${id}`);
  }

  crear(devocional: Devocional): Observable<Devocional> {
    return this.http.post<Devocional>(this.apiUrl, devocional);
  }

  actualizar(id: number, devocional: Devocional): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, devocional);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

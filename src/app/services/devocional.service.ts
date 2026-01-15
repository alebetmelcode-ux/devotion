import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Devocional } from '../models/devocional.model';
import { DevocionalCancion } from '../models/devocional-cancion.model';
import { Song } from '../models/song.model';
import { HttpClient } from '@angular/common/http';
import { SongService } from './song.service';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevocionalService {

  private apiUrl = 'http://localhost:3000/api';
  private devocionalApiUrl = `${this.apiUrl}/devocionales`;

  private http = inject(HttpClient);
  private songService = inject(SongService);

  constructor() { }

  getDevocionales(): Observable<Devocional[]> {
    return this.http.get<Devocional[]>(this.devocionalApiUrl);
  }

  getDevocionalById(id: number): Observable<Devocional | undefined> {
    return this.http.get<Devocional>(`${this.devocionalApiUrl}/${id}`);
  }

  addDevocional(newDevocional: Devocional): Observable<Devocional> {
    return this.http.post<Devocional>(`${this.devocionalApiUrl}/crear-devocional`, newDevocional);
  }

  updateDevocional(id: number, updatedDevocional: Devocional): Observable<Devocional> {
    return this.http.put<Devocional>(`${this.devocionalApiUrl}/editar-devocional/${id}`, updatedDevocional);
  }

  getSongsForDevocional(devocionalId: number): Observable<DevocionalCancion[]> {
    return this.http.get<DevocionalCancion[]>(`${this.devocionalApiUrl}/${devocionalId}/canciones`);
  }

  addSongToDevocional(devocionalCancion: DevocionalCancion): Observable<DevocionalCancion> {
    return this.http.post<DevocionalCancion>(`${this.devocionalApiUrl}/${devocionalCancion['id-devocional']}/add-song`, devocionalCancion);
  }

  
  }


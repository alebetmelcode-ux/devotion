import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {

  songToEdit = signal<Song | undefined>(undefined);

  private apiUrl = 'http://localhost:5138/api/Cancion';
  private http = inject(HttpClient);

  constructor() {}

  getCanciones() {
    return this.http.get<any>(this.apiUrl);
  }
  /* -------------------- GET ALL -------------------- */
  getSongs(): Observable<Song[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.resultado ?? [])
    );
  }

  /* -------------------- ADD -------------------- */
  addSong(newSong: Song): Observable<any> {
    return this.http.post(this.apiUrl, newSong);
  }

  /* -------------------- EDIT STATE -------------------- */
  clearEditing(): void {
    this.songToEdit.set(undefined);
  }

  setEditingSong(song: Song): void {
    this.songToEdit.set(song);
  }

  /* -------------------- GET BY ID (opcional) -------------------- */
  getSongById(id: number): Observable<Song> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.resultado)
    );
  }
  crearMasivo(canciones: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/masivo`, canciones);
  }
}

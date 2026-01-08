import { Injectable, signal, inject } from '@angular/core';
import { Song } from '../models/song.model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SongService {

  songToEdit = signal<Song | undefined>(undefined);

  private apiUrl = 'http://localhost:5138/api';
  private songApiUrl = `${this.apiUrl}/canciones`;

  private http = inject(HttpClient);

  constructor() { }

  getSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.songApiUrl}/listar-cancion`);
  }

  getSongById(id: number): Observable<Song | undefined> {
    return this.http.get<Song>(`${this.songApiUrl}/listar-cancion/${id}`);
  }

  addSong(newSong: Song): Observable<Song> {
    return this.http.post<Song>(`${this.songApiUrl}/crear-cancion`, newSong).pipe(
      tap(song => {
        // After adding, potentially update local state or just let components refetch
        // For simplicity, we'll just return the observable
      })
    );
  }

  updateSong(id: number, updatedSong: Song): Observable<Song> {
    return this.http.put<Song>(`${this.songApiUrl}/editar-cancion/${id}`, updatedSong).pipe(
      tap(song => {
        // For simplicity, we'll just return the observable
      })
    );
  }

  deleteSong(id: number): Observable<void> {
    return this.http.delete<void>(`${this.songApiUrl}/eliminar-cancion/${id}`);
  }

  filterSongs(query: string): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.songApiUrl}/filtrar-contenido`, { params: { query } });
  }

  clearEditing(): void {
    this.songToEdit.set(undefined);
  }

  setEditingSong(song: Song): void {
    this.songToEdit.set(song);
  }
}

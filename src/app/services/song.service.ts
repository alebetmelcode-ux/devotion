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

  /* ==================== GET ALL ==================== */
  getSongs(): Observable<Song[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.resultado ?? [])
    );
  }

  /* ==================== CREATE ==================== */
  createSong(song: Song): Observable<any> {
    const payload = this.toCreatePayload(song);
    return this.http.post(this.apiUrl, payload);
  }

  /* ==================== UPDATE ==================== */
  updateSong(song: Song): Observable<any> {
    const payload = this.toUpdatePayload(song);
    return this.http.put(this.apiUrl, payload);
  }

  /* ==================== SAVE (CREATE / UPDATE) ==================== */
  saveSong(song: Song): Observable<any> {
    return song.id
      ? this.updateSong(song)
      : this.createSong(song);
  }

  /* ==================== DELETE ==================== */
  deleteSong(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /* ==================== MASSIVE CREATE ==================== */
  crearMasivo(canciones: Song[]): Observable<any> {
    const payload = canciones.map(c => this.toCreatePayload(c));
    return this.http.post(`${this.apiUrl}/carga-masiva`, payload);
  }

  /* ==================== EDIT STATE (UI) ==================== */
  clearEditing(): void {
    this.songToEdit.set(undefined);
  }

  setEditingSong(song: Song): void {
    this.songToEdit.set(song);
  }

  /* ==================== PRIVATE MAPPERS ==================== */

  /** Compatible con CrearCancionDto */
  private toCreatePayload(song: Song) {
    return {
      tituloCancion: song.tituloCancion,
      tonoOriginal: song.tonoOriginal,
      idCategoria: song.idCategoria,
      letra: song.letra
    };
  }

  /** Compatible con ActualizarCancionDto */
  private toUpdatePayload(song: Song) {
    return {
      id: song.id,
      tituloCancion: song.tituloCancion,
      tonoOriginal: song.tonoOriginal,
      idCategoria: song.idCategoria,
      letra: song.letra
    };
  }
}

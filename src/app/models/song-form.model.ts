export interface SongFormModel {
  id?: number;          // opcional en creación
  tituloCancion: string;
  tonoOriginal: string;
  tonoFinal: string;    // solo UI
  idCategoria: number | null;
  letra: string;
}

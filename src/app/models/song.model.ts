export interface Song {
  id: number;
  tituloCancion: string;
  tonoOriginal: string;
  idCategoria: number;
  letra: string;
}

export type ParsedLine = {
  lyrics: string;
  chords: string;
};
export interface CreateSongPayload {
  tituloCancion: string;
  tonoOriginal: string;
  idCategoria: number;
  letra: string;
}

export interface UpdateSongPayload extends CreateSongPayload {
  id: number;
}

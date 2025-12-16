export interface Song {
  id: number;
  titulo: string;
  'tono-original': string
  'id-categoria': string;
  letra: string;
  acordes: string;
}

export type ParsedLine = {
  lyrics: string;
  chords: string;
};
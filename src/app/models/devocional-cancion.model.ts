
import { Devocional } from './devocional.model';
import { Song } from './song.model';

export interface DevocionalCancion {
  id: number;

  devocionalId: number;
  devocional?: Devocional;
  cancionId: number;
  cancion?: Song;
  posicionCancion: number;
  acordesFinales: string;
  devocionalCanciones: string;
}


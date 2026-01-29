import { DevocionalCancion } from './devocional-cancion.model';

export interface Devocional {
  id: number;
  nombreDevocional: string;
  canciones: DevocionalCancion[];
}

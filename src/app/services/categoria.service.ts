import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Categoria } from '../../interfaces/categoria';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:5138/api/Categoria';

  constructor(private http: HttpClient) {}

  getCategorias() {
    return this.http.get<any>(this.apiUrl)
      .pipe(
        map(res => res.resultado as Categoria[]) // <- extraemos solo el array
      );
  }
}


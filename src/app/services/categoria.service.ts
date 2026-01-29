import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Categoria } from '../../interfaces/categoria';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = `${environment.apiUrl}Categoria`;

  constructor(private http: HttpClient) {}

  getCategorias() {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.resultado as Categoria[])
    );
  }
}

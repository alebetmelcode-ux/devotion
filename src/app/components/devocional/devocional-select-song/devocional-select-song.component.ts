import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DevocionalService } from '../../../services/devocional.service';
import { SongService } from '../../../services/song.service';
import { Song } from '../../../models/song.model';
import { ToolbarComponent } from "../../toolbar/toolbar";

interface CancionSelectable {
  id: number;
  tituloCancion: string;
  seleccionada: boolean;
}

@Component({
  selector: 'app-devocional-select-song',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ToolbarComponent
  ],
  templateUrl: './devocional-select-song.component.html',
  styleUrls: ['./devocional-select-song.component.css']
})
export class DevocionalSelectSongComponent implements OnInit {

  devocionalId!: number;

  canciones: CancionSelectable[] = [];
  cargando = true;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private devocionalService: DevocionalService,
    private songService: SongService
  ) {}

  ngOnInit(): void {
    this.devocionalId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.devocionalId) {
      this.router.navigate(['/devocionales']);
      return;
    }

    this.songService.getSongs().subscribe({
      next: (lista: Song[]) => {
        this.canciones = lista.map(s => ({
          id: s.id,
          tituloCancion: s.tituloCancion,
          seleccionada: false
        }));
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        alert('Error cargando canciones');
      }
    });
  }

  guardar(): void {
    const seleccionadas = this.canciones.filter(c => c.seleccionada);

    if (!seleccionadas.length) {
      alert('Selecciona al menos una canción');
      return;
    }

    const cancionIds = seleccionadas.map(c => c.id);

    this.guardando = true;

    this.devocionalService
      .agregarCanciones(this.devocionalId, cancionIds)
      .subscribe({
        next: () => {
          this.router.navigate(['/devocionales', this.devocionalId]);
        },
        error: () => {
          this.guardando = false;
          alert('Error al agregar canciones al devocional');
        }
      });
  }
}

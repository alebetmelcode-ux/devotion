import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DevocionalService } from '../../../services/devocional.service';
import { Devocional } from '../../../models/devocional.model';
import { ToolbarComponent } from '../../toolbar/toolbar';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-devocional-list',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    AutoCompleteModule,
    FormsModule
  ],
  templateUrl: './devocional-list.component.html',
  styleUrls: ['./devocional-list.component.css']
})
export class DevocionalListComponent implements OnInit {

  private devocionalService = inject(DevocionalService);
  private router = inject(Router);

  devocionales: Devocional[] = [];
  filteredDevocionales: Devocional[] = [];
  cargando = true;

  ngOnInit(): void {
    console.log('DevocionalListComponent: ngOnInit - Cargando devocionales...');
    this.cargando = true;
    this.devocionalService.obtenerTodos().subscribe({
      next: data => {
        console.log('DevocionalListComponent: Datos recibidos:', data);
        this.devocionales = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('DevocionalListComponent: Error al cargar devocionales:', err);
        this.cargando = false;
      }
    });
  }

  filterDevocionales(event: any): void {
    const query = event.query.toLowerCase();

    this.filteredDevocionales = this.devocionales.filter(d =>
      d.nombreDevocional.toLowerCase().includes(query)
    );
  }

  onDevocionalSelected(event: any): void {
    const devocional: Devocional = event.value;
    this.verDetalle(devocional.id);
  }

 verDetalle(id: number): void {
  this.router.navigate(['/devocionales', id]);
}
 

  crearNuevo(): void {
    this.router.navigate(['/devocionales/nuevo']);
  }
}

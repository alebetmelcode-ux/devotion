import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DevocionalService } from '../../../services/devocional.service';
import { Devocional } from '../../../models/devocional.model';
import { DevocionalCancionDetalle } from '../../../models/devocional-cancion-detalle.model';
import { DevocionalCancionesComponent } from '../devocional-canciones/devocional-canciones.component';
import { ToolbarComponent } from '../../toolbar/toolbar';
import { Button } from "primeng/button";

@Component({
  selector: 'app-devocional-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    DevocionalCancionesComponent,
    ToolbarComponent,
    Button
],
  templateUrl: './devocional-detail.html',
  styleUrls: ['./devocional-detail.css']
})
export class DevocionalDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private devocionalService = inject(DevocionalService);

  devocional?: Devocional;
  canciones: DevocionalCancionDetalle[] = [];

  cargando = true;
  errorCarga = false;

  editando = false;
  formEditar!: FormGroup;

  ngOnInit(): void {
    this.formEditar = this.fb.group({
      nombreDevocional: ['', [Validators.required, Validators.minLength(3)]]
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorCarga = true;
      this.cargando = false;
      return;
    }

    // Devocional
    this.devocionalService.obtenerPorId(id).subscribe({
      next: d => {
        this.devocional = d;
        this.formEditar.patchValue({
          nombreDevocional: d.nombreDevocional
        });
        this.cargando = false;
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      }
    });

    // Canciones
    this.devocionalService.obtenerCanciones(id).subscribe({
      next: canciones => this.canciones = canciones
    });
  }

  // ✅ MÉTODO FALTANTE
  activarEdicion(): void {
    this.editando = true;
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.formEditar.patchValue({
      nombreDevocional: this.devocional?.nombreDevocional
    });
  }

  guardarEdicion(): void {
    if (!this.devocional || this.formEditar.invalid) return;

    this.devocionalService.actualizar({
      id: this.devocional.id,
      nombreDevocional: this.formEditar.value.nombreDevocional
    } as any).subscribe(() => {
      this.devocional!.nombreDevocional =
        this.formEditar.value.nombreDevocional;
      this.editando = false;
    });
  }

  irAgregarCanciones(): void {
    if (!this.devocional) return;

    this.router.navigate(
      ['seleccionar-canciones'],
      { relativeTo: this.route }
    );
  }

  eliminarDevocional(): void {
    if (!this.devocional) return;

    if (!confirm('¿Deseas eliminar este devocional?')) return;

    this.devocionalService.eliminar(this.devocional.id).subscribe(() => {
      this.router.navigate(['/devocionales']);
    });
  }
}

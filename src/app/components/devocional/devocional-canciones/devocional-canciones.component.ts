import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { DevocionalService } from '../../../services/devocional.service';
import { DevocionalCancionDetalle } from '../../../models/devocional-cancion-detalle.model';

@Component({
  selector: 'app-devocional-canciones',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './devocional-canciones.component.html',
  styleUrls: ['./devocional-canciones.component.css']
})
export class DevocionalCancionesComponent {

  @Input() devocionalId!: number;
  @Input() canciones: DevocionalCancionDetalle[] = [];

  guardando = false;

  constructor(
    private devocionalService: DevocionalService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  // =========================
  // DRAG & DROP
  // =========================
  drop(event: CdkDragDrop<DevocionalCancionDetalle[]>) {
    if (this.guardando) return;

    moveItemInArray(
      this.canciones,
      event.previousIndex,
      event.currentIndex
    );

    const payload = this.canciones.map((c, index) => ({
      cancionId: c.cancionId,
      posicionCancion: index + 1
    }));

    this.guardando = true;

    this.devocionalService
      .reordenarCanciones(this.devocionalId, payload)
      .subscribe({
        next: () => {
          this.guardando = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Orden actualizado',
            detail: 'El orden de las canciones fue guardado'
          });
        },
        error: () => {
          this.guardando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar el orden'
          });
        }
      });
  }

  // =========================
  // CONFIRMAR ELIMINACIÓN
  // =========================
  confirmarEliminar(cancion: DevocionalCancionDetalle): void {
    this.confirmationService.confirm({
      header: 'Eliminar canción',
      message: `¿Eliminar "${cancion.tituloCancion}" del devocional?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminar(cancion.cancionId)
    });
  }

  // =========================
  // ELIMINAR RELACIÓN
  // =========================
  private eliminar(cancionId: number): void {
    this.guardando = true;

    this.devocionalService
      .eliminarCancion(this.devocionalId, cancionId)
      .subscribe({
        next: () => {
          this.canciones = this.canciones.filter(
            c => c.cancionId !== cancionId
          );

          this.guardando = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Canción eliminada',
            detail: 'La canción fue removida del devocional'
          });
        },
        error: () => {
          this.guardando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la canción'
          });
        }
      });
  }
}

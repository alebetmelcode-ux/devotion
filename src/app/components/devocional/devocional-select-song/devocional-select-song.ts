import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DevocionalService } from '../../../services/devocional.service';
import { Devocional } from '../../../models/devocional.model';
import { Observable } from 'rxjs';
import { ToolbarComponent } from "../../toolbar/toolbar";

@Component({
  selector: 'app-devocional-select-song',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ToolbarComponent],
  templateUrl: './devocional-select-song.html',
  styleUrls: ['./devocional-select-song.css']
})
export class DevocionalSelectSongComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  devocionalService = inject(DevocionalService);
  fb = inject(FormBuilder);

  devocionales$!: Observable<Devocional[]>;
  selectForm!: FormGroup;

  songId!: number;
  finalChords: string | null = null;

  ngOnInit(): void {
    this.songId = Number(this.route.snapshot.paramMap.get('songId'));
    this.finalChords = this.route.snapshot.paramMap.get('acordes-finales');

    this.devocionales$ = this.devocionalService.getDevocionales();

    this.selectForm = this.fb.group({
      devocional: ['', Validators.required],
      posicion: [1, [Validators.required, Validators.min(1)]],
      acordesFinales: [this.finalChords || '', Validators.required]
    });
  }

  addSongToDevocional(): void {
    if (this.selectForm.valid && this.songId) {
      const formValue = this.selectForm.value;
      this.devocionalService.addSongToDevocional({
        id: 0, // Will be set by service
        'id-devocional': Number(formValue.devocional),
        'id-cancion': this.songId,
        'posicion-cancion': Number(formValue.posicion),
        'acordes-finales': formValue.acordesFinales
      });
      alert('Canción añadida al devocional con éxito.');
      this.router.navigate(['/devocionales', formValue.devocional]); // Navigate to devotional detail
    } else {
      alert('Por favor, selecciona un devocional y completa la posición.');
    }
  }
}

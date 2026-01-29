import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DevocionalService } from '../../../services/devocional.service';
import { ToolbarComponent } from '../../toolbar/toolbar';

@Component({
  selector: 'app-devocional-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarComponent
  ],
  templateUrl: './devocional-create.component.html',
  styleUrls: ['./devocional-create.component.css']
})
export class DevocionalCreateComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private devocionalService = inject(DevocionalService);

  devocionalForm!: FormGroup;

  ngOnInit(): void {
    this.devocionalForm = this.fb.group({
      nombreDevocional: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  saveDevocional(): void {
    if (this.devocionalForm.invalid) return;

    const nombre = this.devocionalForm.value.nombreDevocional;

    this.devocionalService.crear(nombre).subscribe({
      next: (devocional) => {
        // ✅ ahora sí existe el id
        this.router.navigate(['/devocionales', devocional.id]);
      },
      error: (err) => {
        console.error('Error al crear devocional', err);
      }
    });
  }

  irADevocionales(): void {
    this.router.navigate(['/devocionales']);
  }

  irACrearCancion(): void {
    this.router.navigate(['/cancion']);
  }
}

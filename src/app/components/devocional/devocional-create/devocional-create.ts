import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DevocionalService } from '../../../services/devocional.service';

@Component({
  selector: 'app-devocional-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './devocional-create.html',
  styleUrls: ['./devocional-create.css']
})
export class DevocionalCreateComponent implements OnInit {
  devocionalService = inject(DevocionalService);
  router = inject(Router);
  fb = inject(FormBuilder);

  devocionalForm!: FormGroup;

  ngOnInit(): void {
    this.devocionalForm = this.fb.group({
      titulo: ['', Validators.required]
    });
  }

  saveDevocional(): void {
    if (this.devocionalForm.valid) {
      const titulo = this.devocionalForm.value.titulo;
      this.devocionalService.addDevocional({
        id: 0, // The service will assign the real ID
        titulo: titulo
      });
      this.router.navigate(['/devocionales']);
    }
  }
}

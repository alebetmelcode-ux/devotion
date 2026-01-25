import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../services/usuario.service';
import { CompartidoService } from '../services/compartido.service';
import { Login } from '../../interfaces/login';
import { Sesion } from '../../interfaces/sesion';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-login',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    CardModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    TagModule,
    ProgressBarModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  formLogin: FormGroup;
  mostrarLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioServicio: UsuarioService,
    private compartidoServicio: CompartidoService
  ) {
    this.formLogin = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  iniciarSesion(): void {
    if (this.formLogin.invalid) {
      return;
    }

    this.mostrarLoading = true;

    const request: Login = {
      userName: this.formLogin.value.userName,
      password: this.formLogin.value.password
    };

    this.usuarioServicio.iniciarSesion(request).subscribe({
      next: (response: Sesion) => {
        console.log('RESPUESTA LOGIN:', response);

        // ✅ response ES Sesion { token, username }
        this.compartidoServicio.guardarSesion(response);

        this.router.navigate(['/devocionales']);
      },
      error: () => {
        this.compartidoServicio.mostrarAlerta(
          'Credenciales incorrectas',
          'error'
        );
      },
      complete: () => {
        this.mostrarLoading = false;
      }
    });
  }
}

import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { CompartidoService } from '../services/compartido.service';
import { Login } from '../../interfaces/login';
import { CookieService } from 'ngx-cookie-service';
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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
  CommonModule,
    ReactiveFormsModule,
    // PrimeNG
    CardModule,FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    TagModule,
    ProgressBarModule,InputGroupModule,InputGroupAddonModule
   
],
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None, // Desactiva la encapsulación
})
export class LoginComponent {
  formLogin: FormGroup;
  ocultarPassword: boolean = true;
  mostrarLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioServicio: UsuarioService,
    private compartidoServicio: CompartidoService,
    private cookieService: CookieService
  ) {
    this.formLogin = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  iniciarSesion() {
    this.mostrarLoading = true;
    const request: Login = {
      userName: this.formLogin.value.userName,
      password: this.formLogin.value.password,
    };
    this.usuarioServicio.iniciarSesion(request).subscribe({
      next: (response) => {
        this.compartidoServicio.guardarSesion(response);

        this.cookieService.set(
          'Authorization',
          `Bearer ${response.token}`,
          undefined,
          '/',
          undefined,
          true,
          'Strict'
        );

        this.router.navigate(['cancion']);
      },
      complete: () => {
        this.mostrarLoading = false;
      },
      error: (error) => {
        this.compartidoServicio.mostrarAlerta(error.error, 'error');
        this.mostrarLoading = false;
      },
    });
  }
}

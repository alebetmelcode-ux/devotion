import { Component, ViewEncapsulation } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { CompartidoService } from '../services/compartido.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgIf } from '@angular/common';
import { ApiResponse } from '../../interfaces/ApiResponse';
import { Sesion } from '../../interfaces/sesion';
import { FloatLabelModule } from 'primeng/floatlabel';
import { LoaderService } from '../services/loader.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,PasswordModule,ButtonModule, ReactiveFormsModule,
    ToastModule,RippleModule,ProgressSpinnerModule,FloatLabelModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None, // Desactiva la encapsulación
})
export class LoginComponent {
  
  // variable formulario reactivo
  loginForm: FormGroup;

  loading = false;  // Variable para manejar estado de carga

  constructor(
     private fb: FormBuilder,
     private loginService:LoginService,
     private router: Router,
     private compartidoService: CompartidoService,
     private loaderService:LoaderService) {
   
   // Se inicializa el login 
    this.loginForm = this.fb.group({
      Usuario: ['', Validators.required],  // Usuario obligatorio
      Contrasena: ['', [Validators.required,]] // Contraseña min 6 caracteres
    });
    
  }

  ngAfterViewInit() {
    // Retraso para forzar la validación después de que el navegador haya autocompletado los campos
    setTimeout(() => {
      this.loginForm.updateValueAndValidity();
      this.loginForm.markAllAsTouched();
    }, 100);  // Ajusta el retraso si es necesario
  }
  
  IniciarSesion() {

    //Valicion de formulario
    if (this.loginForm.invalid) return;

    //Activa spiner de espera 
    this.loaderService.show();
    
    
    //Inicia el servicio de login 
    this.loginService.iniciarSession(this.loginForm.value).subscribe({
      next: (response: ApiResponse<Sesion>) => {

        // Se guarda objeto de session en local storage
        this.compartidoService.guardarSesion(response.resultado);
        
        // Redirigir al inicio
        this.router.navigate(['/Inicio']); 
      },
      error: (error: HttpErrorResponse) => {
        
        // Se oculta el spinner 
       this.loaderService.hide();
        let mensaje = 'Ocurrió un error inesperado.';
        if (error.status === 401) {
          mensaje = error.error?.mensaje || 'Usuario o contraseña incorrectos.';
        } else if (error.status === 400) {
          mensaje = error.error?.mensaje || 'Faltan datos en el formulario.';
        }else if (error.status === 404) {
          mensaje = error.error?.mensaje || 'Este Usuario no existe.';
        } else if (error.status >= 500) {
          mensaje = 'Error del servidor. Intenta más tarde.';
        }
        this.compartidoService.mostrarAlerta(mensaje, "error");
      },
      complete: () => {

        // se oculta el spiner 
       this.loaderService.hide();
      }
    });
  }

}

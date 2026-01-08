import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Sesion } from '../../interfaces/sesion';

@Injectable({
  providedIn: 'root',
})
export class CompartidoService {
  constructor(private messageService: MessageService) {}

  // Servivio de mensaje notificacion (mensaje/tipo)
  mostrarAlerta(
    mensaje: string,
    tipo: 'success' | 'error' | 'info' | 'warn' = 'error'
  ) {
    this.messageService.add({
      severity: tipo, // Tipo de mensaje (success para el chulito)
      summary: tipo,
      detail: mensaje,
      life: 1200, // Tiempo de vida en milisegundos (3 segundos)
      key: "superior"
    });
  } //mejor y mucho mas facil , me ahorro un crud complero de permisos

  mostrarAlerta2(
    mensaje: string,
    tipo: 'success' | 'error' | 'info' | 'warn' = 'error'
  ) {
    this.messageService.add({
      severity: tipo, // Tipo de mensaje (success para el chulito)
      summary: tipo,
      detail: mensaje,
      life: 2500, // Tiempo de vida en milisegundos (3 segundos)
       key: "central"
    });
  } //mejor y mucho mas facil , me ahorro un crud complero de permisos

  // Guarda la sesion del usuario en local storage(validar mejor opcion)
  guardarSesion(sesion: Sesion) {
    localStorage.setItem('SessionUsuario', JSON.stringify(sesion));
  }

  // Obtener el objeto session de local storage
  obtenerSesion() {
    const sesionString = localStorage.getItem('SessionUsuario');
    const usuarioSesion = JSON.parse(sesionString!);
    return usuarioSesion;
  }

  // eliminar el objeto session de local storage
  eliminarSesion() {
    localStorage.removeItem('SessionUsuario');
  }

  // Obtener el nombre del  objeto session de local storage
  obtenerNombreUsuario(): string | null {
    const usuarioSesion = this.obtenerSesion();
    return usuarioSesion?.nombreCompleto || null; // Retorna el nombre o null si no existe
  }

  // Obtener la cedula  del objeto session de local storage
  obtenerCedulaUsuario(): string | null {
    const cedulaSession = this.obtenerSesion();
    return cedulaSession?.cedula || null; // Retorna el nombre o null si no existe
  }

  obtenerPermisosDesdeToken(): string[] {
    const usuario = this.obtenerSesion(); // Tu método que lee del localStorage
    if (!usuario?.token) return [];

    try {
      const decoded: any = jwtDecode(usuario.token);
      const claimKey = 'Permiso';

      const permisos = decoded[claimKey];

      // Si solo hay un permiso, puede venir como string, no como array
      if (typeof permisos === 'string') return [permisos];
      return Array.isArray(permisos) ? permisos : [];
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return [];
    }
  }

  // servicioSesion o servicioPermisos
  tienePermiso(nombrePermiso: string): boolean {
    const permisos = this.obtenerPermisosDesdeToken();
    return permisos.includes(nombrePermiso);
  }
}
function jwtDecode(token: any): any {
  throw new Error('Function not implemented.');
}


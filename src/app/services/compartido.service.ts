import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Sesion } from '../../interfaces/sesion';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class CompartidoService {
  constructor(private messageService: MessageService) {}

  mostrarAlerta(
    mensaje: string,
    tipo: 'success' | 'error' | 'info' | 'warn' = 'error'
  ) {
    this.messageService.add({
      severity: tipo,
      summary: tipo,
      detail: mensaje,
      life: 1200,
      key: 'superior',
    });
  }

  mostrarAlerta2(
    mensaje: string,
    tipo: 'success' | 'error' | 'info' | 'warn' = 'error'
  ) {
    this.messageService.add({
      severity: tipo,
      summary: tipo,
      detail: mensaje,
      life: 2500,
      key: 'central',
    });
  }

  // ===== SESIÓN =====

  guardarSesion(sesion: Sesion) {
    localStorage.setItem('SessionUsuario', JSON.stringify(sesion));
    localStorage.setItem('token', sesion.token); // 👈 CLAVE para el interceptor
  }

  obtenerSesion(): Sesion | null {
    const sesionString = localStorage.getItem('SessionUsuario');
    return sesionString ? JSON.parse(sesionString) : null;
  }

  eliminarSesion() {
    localStorage.removeItem('SessionUsuario');
    localStorage.removeItem('token');
  }

  // ===== DATOS DEL USUARIO =====

  obtenerNombreUsuario(): string | null {
    const usuarioSesion = this.obtenerSesion();
    return usuarioSesion?.username || null;
  }

  // ===== PERMISOS =====

  obtenerPermisosDesdeToken(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const decoded: any = jwtDecode(token);
      const permisos = decoded['Permiso'];

      if (typeof permisos === 'string') return [permisos];
      return Array.isArray(permisos) ? permisos : [];
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return [];
    }
  }

  tienePermiso(nombrePermiso: string): boolean {
    const permisos = this.obtenerPermisosDesdeToken();
    return permisos.includes(nombrePermiso);
  }
}

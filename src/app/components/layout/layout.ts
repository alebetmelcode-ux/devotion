import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CompartidoService } from '../../services/compartido.service';
import { CookieService } from 'ngx-cookie-service';
import { Drawer } from 'primeng/drawer';
import { Sesion } from '../../../interfaces/sesion';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Drawer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {

  menuItems: any[] = [];
  sidebarVisible = false;

  username: string | null = null;

  constructor(
    private router: Router,
    private compartidoService: CompartidoService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    const usuarioSesion: Sesion | null =
      this.compartidoService.obtenerSesion();

    // ✅ SOLO el nombre, no el objeto completo
    this.username = usuarioSesion?.username || null;
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  cerrarSesion(): void {
    this.compartidoService.eliminarSesion();
    this.cookieService.delete('Authorization', '/');
    this.router.navigate(['login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CompartidoService } from '../../services/compartido.service';
import { CookieService } from 'ngx-cookie-service';
import { Drawer } from "primeng/drawer";

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Drawer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit{
menuItems: any;
sidebarVisible: any;
toggleSidebar() {
throw new Error('Method not implemented.');
}

 username: string = '';

 constructor(private router: Router, private compartidoService: CompartidoService,
             private cookieService: CookieService)
 {
 }

  ngOnInit(): void {
    const usuarioSesion = this.compartidoService.obtenerSesion();
    if(usuarioSesion!=null)
    {
      this.username = usuarioSesion;
    }
  }

   cerrarSesion() {
     this.compartidoService.eliminarSesion();

     this.cookieService.delete('Authorization','/');

     this.router.navigate(['login']);
   }


}

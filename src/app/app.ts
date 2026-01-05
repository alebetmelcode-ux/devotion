import { Component, OnInit, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Drawer } from "./components/drawer/drawer";




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Drawer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('devotion');
  usuarios: any;
  constructor (private http:HttpClient){
   
  }
  ngOnInit(): void {
   this.http.get('http://localhost:5138/api/Usuario').subscribe({
    next: response => this.usuarios = response,
    error: error => console.log(error),
     complete: () => console.log('La solicitud está completa')
   })
  }
}

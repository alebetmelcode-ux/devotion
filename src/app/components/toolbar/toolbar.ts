import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css']
})
export class ToolbarComponent {

  items: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Canciones',
        command: () => this.router.navigate(['/cancion'])
      },
      {
        label: 'Devocionales',
        command: () => this.router.navigate(['/devocionales'])
      }
    ];
  }

  irInicio(): void {
    this.router.navigate(['/cancion']);
  }
}

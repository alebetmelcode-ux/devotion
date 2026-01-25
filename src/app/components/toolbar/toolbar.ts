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
       icon: 'pi pi-folder-open',
        command: () => this.router.navigate(['/cancion'])
      },
      {
        label: 'Devocionales',
        icon: 'pi pi-book',
        command: () => this.router.navigate(['/devocionales'])
      }
    ];
  }

  // ✅ MÉTODO PÚBLICO PARA EL TEMPLATE
  irInicio(): void {
    this.router.navigate(['/devocionales']);
  }
}

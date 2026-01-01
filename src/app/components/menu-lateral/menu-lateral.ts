import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-menu-lateral',
   standalone: true,
  imports: [ CommonModule,
    DrawerModule,
    ButtonModule,
    RippleModule,
    StyleClassModule,AvatarGroupModule,
    AvatarModule
    ],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css',

})
export class MenuLateral {
  visible: boolean = false;

  closeCallback(event: Event): void {
    this.visible = false;
  }
}
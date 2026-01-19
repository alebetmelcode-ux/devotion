import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DevocionalService } from '../../../services/devocional.service';
import { Devocional } from '../../../models/devocional.model';
import { Observable } from 'rxjs';
import { ToolbarComponent } from "../../toolbar/toolbar";

@Component({
  selector: 'app-devocional-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarComponent],
  templateUrl: './devocional-list.html',
  styleUrls: ['./devocional-list.css']
})
export class DevocionalListComponent implements OnInit {

  devocionales: Devocional[] = [];

  constructor(private devocionalService: DevocionalService) {}

  ngOnInit(): void {
    this.devocionalService.obtenerTodos()
      .subscribe(data => this.devocionales = data);
  }
}

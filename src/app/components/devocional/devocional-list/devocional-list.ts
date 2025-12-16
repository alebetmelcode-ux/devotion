import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DevocionalService } from '../../../services/devocional.service';
import { Devocional } from '../../../models/devocional.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-devocional-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './devocional-list.html',
  styleUrls: ['./devocional-list.css']
})
export class DevocionalListComponent implements OnInit {
  devocionalService = inject(DevocionalService);
  devocionales$!: Observable<Devocional[]>;

  ngOnInit(): void {
    this.devocionales$ = this.devocionalService.getDevocionales();
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DevocionalService } from '../../../services/devocional.service';
import { Devocional } from '../../../models/devocional.model';
import { DevocionalCancion } from '../../../models/devocional-cancion.model';
import { Song } from '../../../models/song.model';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ToolbarComponent } from "../../toolbar/toolbar";

@Component({
  selector: 'app-devocional-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarComponent],
  templateUrl: './devocional-detail.html',
  styleUrls: ['./devocional-detail.css']
})
export class DevocionalDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  devocionalService = inject(DevocionalService);

  devocional$!: Observable<Devocional | undefined>;
  songs$!: Observable<(DevocionalCancion & { song: Song | undefined })[]>;

  ngOnInit(): void {
    const devocionalId = Number(this.route.snapshot.paramMap.get('id'));
    if (devocionalId) {
      this.devocional$ = this.devocionalService.getDevocionalById(devocionalId);
    
    }
  }
}

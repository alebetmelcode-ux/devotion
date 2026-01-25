import { Routes } from '@angular/router';

import { Cancion } from './components/cancion/cancion';
import { DevocionalListComponent } from './components/devocional/devocional-list/devocional-list.component';
import { DevocionalDetailComponent } from './components/devocional/devocional-detail/devocional-detail';
import { DevocionalCreateComponent } from './components/devocional/devocional-create/devocional-create.component';
import { DevocionalSelectSongComponent } from './components/devocional/devocional-select-song/devocional-select-song.component';
import { Layout } from './components/layout/layout';
import { LoginComponent } from './login/login';
import { Usuario } from './usuario/usuario';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: Layout,
    children: [
      { path: 'cancion', component: Cancion },

      { path: 'devocionales/nuevo', component: DevocionalCreateComponent },
      {
        path: 'devocionales/:id/seleccionar-canciones',
        component: DevocionalSelectSongComponent
      },
      {
        path: 'devocionales/:id',
        component: DevocionalDetailComponent
      },
      {
        path: 'devocionales',
        component: DevocionalListComponent,
        pathMatch: 'full'
      },
      { path: 'usuario', component: Usuario }
    ]
  },

  { path: '**', redirectTo: 'login' }
];

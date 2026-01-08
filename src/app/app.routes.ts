import { Routes } from '@angular/router';
import { Cancion } from './components/cancion/cancion';
import { DevocionalListComponent } from './components/devocional/devocional-list/devocional-list';
import { DevocionalDetailComponent } from './components/devocional/devocional-detail/devocional-detail';
import { DevocionalCreateComponent } from './components/devocional/devocional-create/devocional-create';
import { DevocionalSelectSongComponent } from './components/devocional/devocional-select-song/devocional-select-song';
import { Layout} from './components/layout/layout'
import { LoginComponent } from './login/login';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    }, 
    {
        path: 'cancion',
        component: Cancion
    },
    {
        path: 'devocionales',
        component: DevocionalListComponent
    },
    {
        path: 'devocionales/nuevo',
        component: DevocionalCreateComponent
    },
    {
        path: 'devocionales/seleccionar-cancion/:songId',
        component: DevocionalSelectSongComponent
    },
    {
        path: 'devocionales/:id',
        component: DevocionalDetailComponent
    },
      {
        path: 'layout',
        component: Layout // Agrega esta ruta
    },
    
];
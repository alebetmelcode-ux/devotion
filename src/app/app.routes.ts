import { Routes } from '@angular/router';
import { Cancion } from './components/cancion/cancion';
import { DevocionalListComponent } from './components/devocional/devocional-list/devocional-list';
import { DevocionalDetailComponent } from './components/devocional/devocional-detail/devocional-detail';
import { DevocionalCreateComponent } from './components/devocional/devocional-create/devocional-create';
import { DevocionalSelectSongComponent } from './components/devocional/devocional-select-song/devocional-select-song';

export const routes: Routes = [
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
        path: '',
        redirectTo: '/cancion', // Redirect to cancion by default
        pathMatch: 'full'
    }
];
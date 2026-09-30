import { Routes } from '@angular/router';
import { CajaView } from './caja-view/caja-view';

export const CAJA_ROUTES: Routes = [
    {
        path: '',
        component: CajaView,
        children: [
            { path: '', redirectTo: 'caja-view', pathMatch: 'full' },
            { path: 'caja-View', component: CajaView, pathMatch: 'full' },

        ]
    }
];

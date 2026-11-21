import { Routes } from '@angular/router';
import { Mesero } from './mesero';

import { TomaPedido } from './toma-pedido/toma-pedido';
import { MeseroDashboard } from './dashboard/dashboard';
export const MESERO_ROUTES: Routes = [
    /*{
        path: '',
        component: Mesero,
        children: [
            // Aquí podrás añadir más rutas HIJAS de admin en el futuro
            // Ejemplo: { path: 'productos', component: AdminProductosComponent }
            // Ejemplo: { path: 'usuarios', component: AdminUsuariosComponent }
            { path: 'toma-pedido', component: TomaPedido },
        ]
    }*/
   {
    // Ruta principal: Carga el Dashboard con las mesas
    path: '',
    component: MeseroDashboard
  },
  {
    // Ruta secundaria: Toma de pedido (puede recibir número de mesa)
    path: 'toma-pedido/:numMesa',
    component: TomaPedido
  },
  {
    // Ruta secundaria: Por si entran sin número de mesa
    path: 'toma-pedido',
    component: TomaPedido
  }
];


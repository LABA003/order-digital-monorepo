import { Routes } from '@angular/router';
import { CocinaView } from './cocina-view/cocina-view';
import { Cocina } from './cocina';

export const COCINA_ROUTES: Routes = [
  {
    path: '',
    component: Cocina,
    children: [
      // 1. Redirección por defecto: Si entran a /cocina, los manda a /cocina/plato_fuerte
      { path: '', redirectTo: 'plato_fuerte', pathMatch: 'full' },
      
      // 2. Ruta Dinámica: Esta es la que hace la magia.
      // Captura 'entrada', 'bebida', etc. en la variable 'categoria'
      { path: ':categoria', component: CocinaView },

      /* Si el usuario entra a /cocina sin categoría, lo redirigimos a una por defecto.
      // Puedes cambiar 'bebida' por la categoría que prefieras.
      { path: '', redirectTo: 'bebida', pathMatch: 'full' },

      // Ruta dinámica: /cocina/:categoria  -> CocinaView recibirá params['categoria']
      // Ejemplos de URLs que funcionarán: /cocina/bebida, /cocina/plato-fuerte, /cocina/entrada
      { path: ':categoria', component: CocinaView },

      // Opciones/aliases (opcionales): normalizar guiones / guiones bajos
      // Si tu UI usa 'plato_fuerte' o 'plato-fuerte' ambas redirigen a la forma con guion
      { path: 'plato_fuerte', redirectTo: 'plato-fuerte', pathMatch: 'full' },
      { path: 'plato-fuerte', redirectTo: 'plato-fuerte', pathMatch: 'full' }, // deja el canonical
      { path: 'bebidas', redirectTo: 'bebida', pathMatch: 'full' },
      { path: 'all', component: CocinaView, data: { all: true } } // si quieres una vista "mostrar todo"*/
    ]
  }
];

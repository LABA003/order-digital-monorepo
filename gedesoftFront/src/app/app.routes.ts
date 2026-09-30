import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { roleGuard } from './auth/role-guard';
import { Login } from './pages/login/login';
import { MainLayout } from './layout/main/main';
import { homeGuard } from './auth/home.guard';


export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    // 2. Ruta "padre" que usa el Layout
    path: '', // Se aplica a 'admin', 'mesero', 'cocina'
    component: MainLayout,
    canActivate: [authGuard], // Protege todo el layout
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'mesero',
        loadChildren: () => import('./pages/mesero/mesero.routes').then(m => m.MESERO_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['MESERO', 'ADMIN'] }
      },
      {
        path: 'cocina',
        loadChildren: () => import('./pages/cocina/cocina.routes').then(m => m.COCINA_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['COCINERO', 'ADMIN'] }
      },
      {
        path: 'caja',
        loadChildren: () => import('./pages/caja/caja.routes').then(m => m.CAJA_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['CAJERO', 'ADMIN'] }
      },
      {
        path: '',
        canActivate: [homeGuard],
        children: []
      }
    ]
  },
  {
    path: '**', // Wildcard (siempre al final)
    redirectTo: 'login'
  }
];

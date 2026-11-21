import { Routes } from '@angular/router';
import { Admin } from './admin';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',  
        component: AdminDashboard,
        children: [
            // Aquí podrás añadir más rutas HIJAS de admin en el futuro
            // Ejemplo: { path: 'productos', component: AdminProductosComponent }
            // Ejemplo: { path: 'usuarios', component: AdminUsuariosComponent }
            {path : 'dashboard', component: AdminDashboard},
        ]
    }
];
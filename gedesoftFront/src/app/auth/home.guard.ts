import { inject, PLATFORM_ID } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth'; // Ajusta la ruta a tu servicio
import { isPlatformBrowser } from '@angular/common';

export const homeGuard = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const role = auth.getUserRole();

  // Lógica de despacho según el rol
  if (role === 'ADMIN') {
    return router.createUrlTree(['/admin']);
  }
  
  if (role === 'MESERO') {
    return router.createUrlTree(['/mesero']);
  }

  if (role === 'COCINERO') {
    return router.createUrlTree(['/cocina']);
  }

  if (role === 'CAJERO') {
    return router.createUrlTree(['/caja']);
  }

  
  return router.createUrlTree(['/login']);
};

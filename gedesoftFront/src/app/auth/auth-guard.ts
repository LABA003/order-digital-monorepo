import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Bypass the guard on the server side so SSR doesn't redirect to login
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const isLoggedIn = authService.isLoggedIn();
  const token = authService.getToken();

  console.log('🔒 [AuthGuard] Intentando entrar a:', state.url);
  console.log('🔒 [AuthGuard] Token encontrado:', token);
  console.log('🔒 [AuthGuard] isLoggedIn:', isLoggedIn);

  if (isLoggedIn) {
    return true;
  }

  console.warn('🔒 [AuthGuard] Bloqueado. Redirigiendo a Login.');
  router.navigate(['/login']);
  return false;
};

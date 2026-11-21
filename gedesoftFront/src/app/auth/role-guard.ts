import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // 1. Obtiene los roles esperados de la data de la ruta
  const expectedRoles = route.data['roles'] as Array<string>;
  const rawRole = authService.getUserRole();

  // 2. Obtiene el rol actual del usuario
  const currentUserRole = authService.getUserRole();

  console.log(`🛡️ [RoleGuard] Ruta: ${state.url}`);
  console.log(`🛡️ [RoleGuard] Rol del usuario: '${rawRole}' -> Normalizado: '${currentUserRole}'`);
  console.log(`🛡️ [RoleGuard] Roles esperados:`, expectedRoles);
  
  // 3. Comprueba si el rol existe y está en la lista de roles esperados
  if (!currentUserRole || !expectedRoles.includes(currentUserRole)) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

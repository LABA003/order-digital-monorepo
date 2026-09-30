import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Auth } from '../services/auth';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  let request = req;

  // Si estamos en SSR, cambia localhost por nest_app para que el contenedor pueda llegar al backend
  if (isPlatformServer(platformId) && request.url.includes('localhost:3000')) {
    request = request.clone({
      url: request.url.replace('localhost:3000', 'nest_app:3000')
    });
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 (No autorizado), entonces sacamos al usuario
      if (error.status === 401) {
        console.error('⛔ [Interceptor] Token rechazado por el servidor (401).');
        
        // Evitar que el SSR redireccione al login, solo hacerlo en el cliente
        if (isPlatformBrowser(platformId)) {
          console.error('Cerrando sesión en el cliente.');
          authService.logout(); // Esto limpia el localStorage y manda al login
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

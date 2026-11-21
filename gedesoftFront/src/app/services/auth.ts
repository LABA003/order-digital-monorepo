import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, Inject } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common'; 
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl + '/auth'; 

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  login(credentials: any): Observable<any> {
    return this.http
      .post<{ accessToken: string; user: any }>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap((response) => {
          // 4. PROTEGIDO: Solo se ejecuta en el navegador
          if (isPlatformBrowser(this.platformId)) { 
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('user_role', response.user.role); 
          }
        })
      );
  }

  logout(): void {
    // 5. PROTEGIDO: Solo se ejecuta en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_role');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    // 6. PROTEGIDO: Solo se ejecuta en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null; // Si estÃ¡ en el servidor, no hay token
  }

  getUserRole(): string | null {
    // 7. PROTEGIDO: Solo se ejecuta en el navegador
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_role');
    }
    return null; // Si estÃ¡ en el servidor, no hay rol
  }

  isLoggedIn(): boolean {
    // Este mÃ©todo ahora es seguro, porque getToken() ya estÃ¡ protegido
    return !!this.getToken(); 
  }
}

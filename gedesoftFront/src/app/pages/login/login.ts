// login.ts
import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string | null = null;

  private authService = inject(Auth);
  private router = inject(Router);

  onSubmit() {
    this.errorMessage = null;
    console.log('Intentando login con credenciales:', this.credentials);

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Respuesta login (raw):', response);

        // Leer lo que quedó guardado por Auth.login (tap)
        const savedRole = this.authService.getUserRole();
        const savedToken = this.authService.getToken();
        console.log('Role guardado en localStorage:', savedRole);
        console.log('Token guardado en localStorage:', savedToken);

        // Normaliza por si acaso y decide target
        const role = (savedRole ?? response?.user?.role ?? '').toString().toUpperCase();
        console.log('Role normalizado a usar para navegación:', role);

        let target = '/';
        if (role === 'ADMIN') target = '/admin';
        else if (role === 'MESERO') target = '/mesero';
        else if (role === 'COCINERO') target = '/cocina';
        else if (role === 'CAJERO') target = '/caja';

        // Navegar UNA sola vez al target decidido
        this.router.navigateByUrl(target).then(
          success => console.log('navigateByUrl success?', success, 'target:', target),
          err => {
            console.error('navigateByUrl error:', err);
            // fallback: si falla, navegar a login para evitar bucles
            this.router.navigate(['/login']);
          }
        );
      },

      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos. Intente de nuevo.';
        console.error('Error de login:', err);
      }
    });
  }
}

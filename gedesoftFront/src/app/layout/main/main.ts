import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,             
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],    
})
export class MainLayout {
  authService = inject(Auth);
  userRole: string | null = null;

  constructor() {
    this.userRole = this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">🌧️</span>
        <span class="brand-name">MagicRain</span>
      </div>
      <div class="navbar-links" *ngIf="currentUser">
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/profile">Mi Perfil</a>
        <ng-container *ngIf="isAdmin">
          <a routerLink="/admin/simulator">Simulador</a>
          <a routerLink="/admin/nodes">Nodos</a>
          <a routerLink="/admin/users">Usuarios</a>
          <a routerLink="/admin/readings">Lecturas</a>
        </ng-container>
      </div>
      <div class="navbar-user" *ngIf="currentUser">
        <span class="user-badge" *ngIf="isAdmin">ADMIN</span>
        <span class="user-name">{{ currentUser.name }}</span>
        <button class="btn-logout" (click)="logout()">Salir</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: #dd1100;
      padding: 0 32px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon { font-size: 1.6rem; }
    .brand-name {
      font-size: 1.4rem;
      font-weight: 800;
      color: #fefefe;
      letter-spacing: 1px;
    }
    .navbar-links {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .navbar-links a {
      color: #fefefe;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .navbar-links a:hover {
      background-color: rgba(255,255,255,0.15);
      color: #fec300;
    }
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-badge {
      background-color: #fec300;
      color: #19192e;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .user-name {
      color: #fefefe;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .btn-logout {
      background-color: transparent;
      border: 2px solid #fefefe;
      color: #fefefe;
      padding: 6px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background-color: #fefefe;
      color: #dd1100;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  logout() {
    this.authService.logout();
  }
}

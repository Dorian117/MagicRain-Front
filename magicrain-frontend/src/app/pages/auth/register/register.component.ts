import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-icon">🌧️</span>
          <h1>MagicRain</h1>
          <h2>Crear cuenta</h2>
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" [(ngModel)]="name" placeholder="Tu nombre completo" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="tu@email.com" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="password" placeholder="Mínimo 6 caracteres" />
        </div>
        <p class="error-message" *ngIf="errorMsg">{{ errorMsg }}</p>
        <p class="success-message" *ngIf="successMsg">{{ successMsg }}</p>
        <button class="btn-primary btn-full" (click)="register()" [disabled]="loading">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
        <p class="auth-footer">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background-color: #19192e;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .auth-card {
      background-color: #16213e;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      border: 1px solid rgba(254,195,0,0.2);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-icon { font-size: 3rem; }
    .auth-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #fefefe;
      margin: 8px 0 4px;
    }
    .auth-header h2 {
      font-size: 1rem;
      color: #fdc302;
      font-weight: 400;
    }
    .btn-full { width: 100%; padding: 14px; font-size: 1rem; }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      color: #aaa;
      font-size: 0.9rem;
    }
    .error-message {
      color: #ff4444;
      font-size: 0.9rem;
      margin-bottom: 12px;
      text-align: center;
    }
    .success-message {
      color: #44bb44;
      font-size: 0.9rem;
      margin-bottom: 12px;
      text-align: center;
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  errorMsg = '';
  successMsg = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.successMsg = '¡Cuenta creada! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error al registrarse';
        this.loading = false;
      }
    });
  }
}

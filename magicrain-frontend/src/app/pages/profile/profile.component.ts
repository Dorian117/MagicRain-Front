import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>👤 Mi Perfil</h1>
      </div>

      <div class="profile-grid">
        <div class="card-dark profile-card">
          <div class="avatar">
            {{ getInitials() }}
          </div>
          <h2>{{ currentUser?.name }}</h2>
          <p class="email">{{ currentUser?.email }}</p>
          <span class="badge" [class.badge-admin]="currentUser?.role === 'admin'"
            [class.badge-active]="currentUser?.role === 'user'">
            {{ currentUser?.role }}
          </span>
        </div>

        <div class="card-dark edit-card">
          <h2>Editar información</h2>
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="form.name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" />
          </div>
          <p class="error-message" *ngIf="errorMsg">{{ errorMsg }}</p>
          <p class="success-message" *ngIf="successMsg">{{ successMsg }}</p>
          <button class="btn-primary btn-save" (click)="saveProfile()" [disabled]="loading">
            {{ loading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    .profile-card {
      display: flex; flex-direction: column;
      align-items: center; gap: 16px; padding: 40px 24px; text-align: center;
    }
    .avatar {
      width: 90px; height: 90px; border-radius: 50%;
      background-color: #dd1100; color: #fefefe;
      font-size: 2rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .profile-card h2 { color: #fefefe; font-size: 1.3rem; }
    .email { color: rgba(255,255,255,0.5); font-size: 0.9rem; }
    .edit-card { padding: 32px; }
    .edit-card h2 { margin-bottom: 24px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { color: #fdc302; font-weight: 600;
      font-size: 0.9rem; display: block; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px;
      background-color: #0f3460; color: #fefefe;
      border: 2px solid rgba(254,195,0,0.2); border-radius: 8px; }
    input:focus { outline: none; border-color: #fec300; }
    .btn-save { padding: 12px 32px; margin-top: 8px; }
    .error-message { color: #ff4444; font-size: 0.9rem; margin-bottom: 8px; }
    .success-message { color: #44bb44; font-size: 0.9rem; margin-bottom: 8px; }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  form: Partial<User> = { name: '', email: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.form = { name: this.currentUser.name, email: this.currentUser.email };
    }
  }

  getInitials(): string {
    if (!this.currentUser?.name) return '?';
    return this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  saveProfile() {
    if (!this.form.name || !this.form.email) {
      this.errorMsg = 'Nombre y email son requeridos';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const id = this.currentUser?._id || this.currentUser?.id;

    this.userService.update(id!, this.form).subscribe({
      next: res => {
        this.successMsg = '✅ Perfil actualizado correctamente';
        this.loading = false;
        const updated = { ...this.currentUser, ...this.form } as User;
        this.currentUser = updated;
        localStorage.setItem('magicrain_user', JSON.stringify(updated));
        this.cdr.detectChanges();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Error al actualizar';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>👥 Gestión de Usuarios</h1>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge"
                  [class.badge-admin]="user.role === 'admin'"
                  [class.badge-active]="user.role === 'user'">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt!) }}</td>
              <td class="actions">
                <button class="btn-secondary btn-sm" (click)="openEditModal(user)">Editar</button>
                <button class="btn-danger btn-sm" (click)="deleteUser(user._id!)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="5" class="empty">No hay usuarios registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Usuario</h2>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>
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
          <button class="btn-primary btn-full" (click)="saveUser()" [disabled]="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 32px; }
    .table-wrapper { border-radius: 12px; overflow: hidden; }
    .actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; font-size: 0.85rem; }
    .empty { text-align: center; color: #999; padding: 32px; }
    .btn-close { background: transparent; color: #fefefe;
      font-size: 1.2rem; padding: 4px 8px; }
    .btn-full { width: 100%; margin-top: 8px; padding: 12px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { color: #fdc302; font-weight: 600;
      font-size: 0.9rem; display: block; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px;
      background-color: #0f3460; color: #fefefe;
      border: 2px solid rgba(254,195,0,0.2); border-radius: 8px; }
    .error-message { color: #ff4444; font-size: 0.9rem; margin-bottom: 8px; }
    .success-message { color: #44bb44; font-size: 0.9rem; margin-bottom: 8px; }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  showModal = false;
  editingUser: User | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  form: Partial<User> = { name: '', email: '' };

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: res => {
        this.users = res.users;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  openEditModal(user: User) {
    this.editingUser = user;
    this.form = { name: user.name, email: user.email };
    this.errorMsg = '';
    this.successMsg = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
  }

  saveUser() {
    if (!this.form.name || !this.form.email) {
      this.errorMsg = 'Nombre y email son requeridos';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.userService.update(this.editingUser!._id!, this.form).subscribe({
      next: () => {
        this.successMsg = 'Usuario actualizado';
        this.loading = false;
        this.loadUsers();
        setTimeout(() => { this.showModal = false; this.successMsg = ''; }, 1500);
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Error al guardar';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(id: string) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleString('es-CO');
  }
}

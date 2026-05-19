import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { NodeService } from '../../../core/services/node.service';
import { Node } from '../../../core/models/node.model';

@Component({
  selector: 'app-nodes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>📡 Gestión de Nodos</h1>
        <button class="btn-primary" (click)="openModal()">+ Nuevo Nodo</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Zona</th>
              <th>Estado</th>
              <th>Última lectura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let node of nodes">
              <td>{{ node.name }}</td>
              <td>{{ node.zone }}</td>
              <td>
                <span class="badge"
                  [class.badge-active]="node.status === 'active'"
                  [class.badge-inactive]="node.status !== 'active'">
                  {{ node.status }}
                </span>
              </td>
              <td>{{ node.lastReading ? formatDate(node.lastReading) : 'Sin lecturas' }}</td>
              <td class="actions">
                <button class="btn-secondary btn-sm" (click)="openEditModal(node)">Editar</button>
                <button class="btn-danger btn-sm" (click)="deleteNode(node._id!)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="nodes.length === 0">
              <td colspan="5" class="empty">No hay nodos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingNode ? 'Editar Nodo' : 'Nuevo Nodo' }}</h2>
            <button class="btn-close" (click)="closeModal()">✕</button>
          </div>
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Nodo Chapinero" />
          </div>
          <div class="form-group">
            <label>Zona</label>
            <input type="text" [(ngModel)]="form.zone" placeholder="Chapinero" />
          </div>
          <div class="form-group" *ngIf="editingNode">
            <label>Estado</label>
            <select [(ngModel)]="form.status">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="fault">Fallo</option>
            </select>
          </div>
          <p class="error-message" *ngIf="errorMsg">{{ errorMsg }}</p>
          <p class="success-message" *ngIf="successMsg">{{ successMsg }}</p>
          <button class="btn-primary btn-full" (click)="saveNode()" [disabled]="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 32px;
    }
    .table-wrapper { border-radius: 12px; overflow: hidden; }
    .actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; font-size: 0.85rem; }
    .empty { text-align: center; color: #999; padding: 32px; }
    .btn-close {
      background: transparent; color: #fefefe;
      font-size: 1.2rem; padding: 4px 8px;
    }
    .btn-full { width: 100%; margin-top: 8px; padding: 12px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { color: #fdc302; font-weight: 600;
      font-size: 0.9rem; display: block; margin-bottom: 6px; }
    input, select { width: 100%; padding: 10px 12px;
      background-color: #0f3460; color: #fefefe;
      border: 2px solid rgba(254,195,0,0.2); border-radius: 8px; }
    .error-message { color: #ff4444; font-size: 0.9rem; margin-bottom: 8px; }
    .success-message { color: #44bb44; font-size: 0.9rem; margin-bottom: 8px; }
  `]
})
export class NodesComponent implements OnInit {
  nodes: Node[] = [];
  showModal = false;
  editingNode: Node | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  form: Partial<Node> = { name: '', zone: '', status: 'active' };

  constructor(private nodeService: NodeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadNodes();
  }

  loadNodes() {
    this.nodeService.getAll().subscribe({
      next: res => {
        this.nodes = res.nodes;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  openModal() {
    this.editingNode = null;
    this.form = { name: '', zone: '', status: 'active' };
    this.errorMsg = '';
    this.successMsg = '';
    this.showModal = true;
  }

  openEditModal(node: Node) {
    this.editingNode = node;
    this.form = { name: node.name, zone: node.zone, status: node.status };
    this.errorMsg = '';
    this.successMsg = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingNode = null;
  }

  saveNode() {
    if (!this.form.name || !this.form.zone) {
      this.errorMsg = 'Nombre y zona son requeridos';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const request = this.editingNode
      ? this.nodeService.update(this.editingNode._id!, this.form)
      : this.nodeService.create(this.form);

    request.subscribe({
      next: () => {
        this.successMsg = this.editingNode ? 'Nodo actualizado' : 'Nodo creado';
        this.loading = false;
        this.loadNodes();
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

  deleteNode(id: string) {
    if (!confirm('¿Eliminar este nodo?')) return;
    this.nodeService.delete(id).subscribe({
      next: () => {
        this.loadNodes();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-CO');
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ReadingService } from '../../../core/services/reading.service';
import { NodeService } from '../../../core/services/node.service';
import { Reading } from '../../../core/models/reading.model';
import { Node } from '../../../core/models/node.model';

@Component({
  selector: 'app-readings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>📋 Historial de Lecturas</h1>
        <span class="total-badge">{{ total }} lecturas</span>
        <button class="btn-danger btn-clean" (click)="deleteOrphanReadings()">
          🗑️ Limpiar sin nodo
        </button>
      </div>

      <div class="filters card-dark">
        <h2>Filtros</h2>
        <div class="filters-grid">
          <div class="form-group">
            <label>Nodo</label>
            <select [(ngModel)]="filterNodeId" (change)="applyFilters()">
              <option value="">Todos</option>
              <option *ngFor="let node of nodes" [value]="node._id">
                {{ node.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Condición</label>
            <select [(ngModel)]="filterCondition" (change)="applyFilters()">
              <option value="">Todas</option>
              <option value="rain">🌧️ Lluvia</option>
              <option value="sun">☀️ Sol</option>
              <option value="cold">🥶 Frío</option>
              <option value="cloudy">☁️ Nublado</option>
              <option value="fog">🌫️ Niebla</option>
            </select>
          </div>
          <div class="form-group">
            <label>Desde</label>
            <input type="datetime-local" [(ngModel)]="filterStartDate" (change)="applyFilters()" />
          </div>
          <div class="form-group">
            <label>Hasta</label>
            <input type="datetime-local" [(ngModel)]="filterEndDate" (change)="applyFilters()" />
          </div>
        </div>
        <button class="btn-secondary btn-clear" (click)="clearFilters()">Limpiar filtros</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Condición</th>
              <th>Nodo</th>
              <th>Temp.</th>
              <th>Humedad</th>
              <th>Presión</th>
              <th>Lluvia</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let reading of readings">
              <td>
                <span class="badge" [ngClass]="'badge-' + reading.condition">
                  {{ getConditionIcon(reading.condition) }} {{ reading.condition }}
                </span>
              </td>
              <td>{{ getNodeName(reading.nodeId) }}</td>
              <td>{{ reading.temperature }}°C</td>
              <td>{{ reading.humidity }}%</td>
              <td>{{ reading.pressure }} hPa</td>
              <td>{{ reading.rainfall ? '✅' : '❌' }}</td>
              <td>{{ formatDate(reading.timestamp!) }}</td>
              <td>
                <button class="btn-danger btn-sm" (click)="deleteReading(reading._id!)">
                  Eliminar
                </button>
              </td>
            </tr>
            <tr *ngIf="readings.length === 0">
              <td colspan="8" class="empty">No hay lecturas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 24px; }
    .total-badge { background-color: #dd1100; color: #fefefe;
      padding: 6px 16px; border-radius: 20px; font-weight: 700; }
    .filters { padding: 24px; margin-bottom: 24px; }
    .filters h2 { margin-bottom: 16px; }
    .filters-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { color: #fdc302; font-weight: 600; font-size: 0.85rem; }
    select, input[type="datetime-local"] {
      padding: 8px 12px; background-color: #0f3460; color: #fefefe;
      border: 2px solid rgba(254,195,0,0.2); border-radius: 8px; font-size: 0.9rem; }
    .btn-clear { margin-top: 16px; padding: 8px 20px; font-size: 0.9rem; }
    .btn-clean { padding: 8px 16px; font-size: 0.85rem; }
    .table-wrapper { border-radius: 12px; overflow: hidden; }
    .btn-sm { padding: 5px 12px; font-size: 0.8rem; }
    .empty { text-align: center; color: #999; padding: 32px; }
  `]
})
export class ReadingsComponent implements OnInit {
  readings: Reading[] = [];
  nodes: Node[] = [];
  total = 0;
  filterNodeId = '';
  filterCondition = '';
  filterStartDate = '';
  filterEndDate = '';

  constructor(
    private readingService: ReadingService,
    private nodeService: NodeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nodeService.getAll().subscribe({
      next: res => { this.nodes = res.nodes; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.loadReadings();
  }

  loadReadings() {
    const filters: any = {};
    if (this.filterNodeId)    filters.nodeId    = this.filterNodeId;
    if (this.filterCondition) filters.condition = this.filterCondition;
    if (this.filterStartDate) filters.startDate = this.filterStartDate;
    if (this.filterEndDate)   filters.endDate   = this.filterEndDate;

    this.readingService.getAll(filters).subscribe({
      next: res => {
        this.readings = res.readings;
        this.total = res.total;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  applyFilters() { this.loadReadings(); }

  clearFilters() {
    this.filterNodeId = '';
    this.filterCondition = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loadReadings();
  }

  deleteReading(id: string) {
    if (!confirm('¿Eliminar esta lectura?')) return;
    this.readingService.delete(id).subscribe({
      next: () => { this.loadReadings(); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getConditionIcon(condition: string): string {
    const icons: Record<string, string> = {
      rain: '🌧️', sun: '☀️', cold: '🥶', cloudy: '☁️', fog: '🌫️'
    };
    return icons[condition] || '🌡️';
  }

  getNodeName(nodeId: any): string {
    if (typeof nodeId === 'object') return nodeId?.name || '';
    const node = this.nodes.find(n => n._id === nodeId);
    return node?.name || '';
  }

  deleteOrphanReadings() {
    if (!confirm('¿Eliminar todas las lecturas sin nodo asociado?')) return;
    const orphans = this.readings.filter(r => {
      if (typeof r.nodeId === 'object') return !r.nodeId?._id;
      return !this.nodes.find(n => n._id === r.nodeId);
    });
    if (orphans.length === 0) {
      alert('No hay lecturas huérfanas');
      return;
    }
    const deletes = orphans.map(r => this.readingService.delete(r._id!));
    let completed = 0;
    deletes.forEach(d => d.subscribe({
      next: () => {
        completed++;
        if (completed === deletes.length) {
          this.loadReadings();
          this.cdr.detectChanges();
        }
      },
      error: () => { completed++; }
    }));
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleString('es-CO');
  }
}

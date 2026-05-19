import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ReadingService } from '../../core/services/reading.service';
import { NodeService } from '../../core/services/node.service';
import { Reading } from '../../core/models/reading.model';
import { Node } from '../../core/models/node.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">

      <div class="page-header">
        <h1>🌦️ Dashboard Climático</h1>
        <select class="node-select" (change)="onNodeChange($event)">
          <option value="">Todos los nodos</option>
          <option *ngFor="let node of nodes" [value]="node._id">
            {{ node.name }} — {{ node.zone }}
          </option>
        </select>
      </div>

      <div *ngIf="loading" class="loading">Cargando datos...</div>

      <div *ngIf="!loading && latestReading" class="dashboard-grid">

        <div class="condition-card card-dark">
          <div class="condition-icon">{{ getConditionIcon(latestReading.condition) }}</div>
          <h2>{{ getConditionLabel(latestReading.condition) }}</h2>
          <p class="condition-time">
            Última lectura: {{ formatDate(latestReading.timestamp) }}
          </p>
          <p class="condition-node" *ngIf="getNodeName(latestReading.nodeId)">
            📍 {{ getNodeName(latestReading.nodeId) }}
          </p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card card-dark">
            <span class="metric-icon">🌡️</span>
            <span class="metric-value">{{ latestReading.temperature }}°C</span>
            <span class="metric-label">Temperatura</span>
          </div>
          <div class="metric-card card-dark">
            <span class="metric-icon">💧</span>
            <span class="metric-value">{{ latestReading.humidity }}%</span>
            <span class="metric-label">Humedad</span>
          </div>
          <div class="metric-card card-dark">
            <span class="metric-icon">🔵</span>
            <span class="metric-value">{{ latestReading.pressure }} hPa</span>
            <span class="metric-label">Presión</span>
          </div>
          <div class="metric-card card-dark">
            <span class="metric-icon">🌧️</span>
            <span class="metric-value">{{ latestReading.rainfall ? 'Sí' : 'No' }}</span>
            <span class="metric-label">Lluvia activa</span>
          </div>
        </div>

      </div>

      <div *ngIf="!loading && !latestReading" class="no-data card-dark">
        <span>😶‍🌫️</span>
        <p>No hay lecturas disponibles aún.</p>
      </div>

      <div class="chart-section card-dark" *ngIf="readings.length > 0">
        <h2>📈 Historial de temperatura y humedad</h2>
        <div class="chart-wrapper">
          <svg [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight"
               class="chart-svg">

            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dd1100" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#dd1100" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fec300" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#fec300" stop-opacity="0"/>
              </linearGradient>
            </defs>

            <line *ngFor="let line of gridLines"
              [attr.x1]="padding" [attr.y1]="line.y"
              [attr.x2]="chartWidth - padding" [attr.y2]="line.y"
              stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

            <text *ngFor="let line of gridLines"
              [attr.x]="padding - 8" [attr.y]="line.y + 4"
              fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="end">
              {{ line.label }}
            </text>

            <polyline
              [attr.points]="tempAreaPoints"
              fill="url(#tempGrad)" stroke="none"/>
            <polyline
              [attr.points]="tempLinePoints"
              fill="none" stroke="#dd1100" stroke-width="2"
              stroke-linejoin="round" stroke-linecap="round"/>

            <polyline
              [attr.points]="humAreaPoints"
              fill="url(#humGrad)" stroke="none"/>
            <polyline
              [attr.points]="humLinePoints"
              fill="none" stroke="#fec300" stroke-width="2"
              stroke-linejoin="round" stroke-linecap="round"/>

            <circle *ngFor="let p of tempPoints"
              [attr.cx]="p.x" [attr.cy]="p.y" r="3"
              fill="#dd1100" stroke="#19192e" stroke-width="1.5"/>
            <circle *ngFor="let p of humPoints"
              [attr.cx]="p.x" [attr.cy]="p.y" r="3"
              fill="#fec300" stroke="#19192e" stroke-width="1.5"/>

          </svg>
        </div>
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot" style="background:#dd1100"></span>
            Temperatura (°C)
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background:#fec300"></span>
            Humedad (%)
          </span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .node-select {
      width: auto;
      padding: 10px 16px;
      background-color: #16213e;
      color: #fefefe;
      border: 2px solid rgba(254,195,0,0.3);
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .loading {
      text-align: center;
      color: #fdc302;
      font-size: 1.2rem;
      padding: 60px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .condition-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 24px;
      gap: 12px;
    }
    .condition-icon { font-size: 5rem; }
    .condition-card h2 {
      font-size: 1.8rem;
      color: #fdc302;
    }
    .condition-time {
      color: rgba(255,255,255,0.5);
      font-size: 0.85rem;
    }
    .condition-node {
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      gap: 8px;
      text-align: center;
    }
    .metric-icon { font-size: 2rem; }
    .metric-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: #fefefe;
    }
    .metric-label {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.5);
    }
    .no-data {
      text-align: center;
      padding: 60px;
      font-size: 1.1rem;
      color: rgba(255,255,255,0.5);
    }
    .no-data span { font-size: 3rem; display: block; margin-bottom: 12px; }
    .chart-section {
      margin-top: 8px;
    }
    .chart-section h2 { margin-bottom: 20px; }
    .chart-wrapper {
      width: 100%;
      overflow-x: auto;
    }
    .chart-svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .chart-legend {
      display: flex;
      gap: 24px;
      justify-content: center;
      margin-top: 16px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.7);
      font-size: 0.9rem;
    }
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  latestReading: Reading | null = null;
  readings: Reading[] = [];
  nodes: Node[] = [];
  loading = true;
  selectedNodeId = '';

  chartWidth = 800;
  chartHeight = 260;
  padding = 48;

  tempPoints: { x: number; y: number }[] = [];
  humPoints: { x: number; y: number }[] = [];
  tempLinePoints = '';
  humLinePoints = '';
  tempAreaPoints = '';
  humAreaPoints = '';
  gridLines: { y: number; label: string }[] = [];

  constructor(
    private readingService: ReadingService,
    private nodeService: NodeService
  ) {}

  ngOnInit() {
    this.nodeService.getAll().subscribe({
      next: res => this.nodes = res.nodes,
      error: () => {}
    });
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const filters = this.selectedNodeId ? { nodeId: this.selectedNodeId } : {};

    this.readingService.getLatest().subscribe({
      next: res => this.latestReading = res.reading,
      error: () => this.latestReading = null
    });

    this.readingService.getAll(filters).subscribe({
      next: res => {
        this.readings = res.readings.slice(0, 20).reverse();
        this.buildChart();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onNodeChange(event: Event) {
    this.selectedNodeId = (event.target as HTMLSelectElement).value;
    this.loadData();
  }

  buildChart() {
    if (this.readings.length < 2) return;

    const w = this.chartWidth - this.padding * 2;
    const h = this.chartHeight - this.padding * 2;

    const minVal = 0;
    const maxVal = 100;

    this.gridLines = [0, 25, 50, 75, 100].map(v => ({
      y: this.padding + h - ((v - minVal) / (maxVal - minVal)) * h,
      label: String(v)
    }));

    this.tempPoints = this.readings.map((r, i) => ({
      x: this.padding + (i / (this.readings.length - 1)) * w,
      y: this.padding + h - ((r.temperature - minVal) / (maxVal - minVal)) * h
    }));

    this.humPoints = this.readings.map((r, i) => ({
      x: this.padding + (i / (this.readings.length - 1)) * w,
      y: this.padding + h - ((r.humidity - minVal) / (maxVal - minVal)) * h
    }));

    this.tempLinePoints = this.tempPoints.map(p => `${p.x},${p.y}`).join(' ');
    this.humLinePoints = this.humPoints.map(p => `${p.x},${p.y}`).join(' ');

    const bottomY = this.padding + h;
    const firstX = this.tempPoints[0].x;
    const lastX = this.tempPoints[this.tempPoints.length - 1].x;

    this.tempAreaPoints = `${firstX},${bottomY} ` +
      this.tempPoints.map(p => `${p.x},${p.y}`).join(' ') +
      ` ${lastX},${bottomY}`;

    this.humAreaPoints = `${firstX},${bottomY} ` +
      this.humPoints.map(p => `${p.x},${p.y}`).join(' ') +
      ` ${lastX},${bottomY}`;
  }

  getConditionIcon(condition: string): string {
    const icons: Record<string, string> = {
      rain: '🌧️', sun: '☀️', cold: '🥶', cloudy: '☁️', fog: '🌫️'
    };
    return icons[condition] || '🌡️';
  }

  getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
      rain: 'Lluvia', sun: 'Soleado', cold: 'Frío', cloudy: 'Nublado', fog: 'Niebla'
    };
    return labels[condition] || condition;
  }

  getNodeName(nodeId: any): string {
    if (typeof nodeId === 'object') return nodeId?.name || '';
    const node = this.nodes.find(n => n._id === nodeId);
    return node?.name || '';
  }

  formatDate(timestamp?: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('es-CO');
  }
}

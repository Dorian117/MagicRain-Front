import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ReadingService } from '../../../core/services/reading.service';
import { NodeService } from '../../../core/services/node.service';
import { Node } from '../../../core/models/node.model';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">

      <div class="page-header">
        <h1>🎮 Simulador de Sensor</h1>
      </div>

      <div class="simulator-grid">

        <div class="card-dark selector-card">
          <h2>Selecciona un nodo</h2>
          <select [(ngModel)]="selectedNodeId" class="node-select">
            <option value="">-- Selecciona un nodo --</option>
            <option *ngFor="let node of nodes" [value]="node._id">
              {{ node.name }} — {{ node.zone }}
            </option>
          </select>
        </div>

        <div class="card-dark conditions-card">
          <h2>Condición climática</h2>
          <div class="condition-buttons">
            <button
              *ngFor="let c of conditions"
              class="condition-btn"
              [class.selected]="selectedCondition === c.value"
              (click)="selectCondition(c)">
              <span class="btn-icon">{{ c.icon }}</span>
              <span class="btn-label">{{ c.label }}</span>
            </button>
          </div>
        </div>

        <div class="card-dark values-card">
          <h2>Valores del sensor</h2>
          <div class="values-grid">
            <div class="form-group">
              <label>🌡️ Temperatura (°C)</label>
              <input type="number" [(ngModel)]="temperature"
                min="-10" max="40" />
            </div>
            <div class="form-group">
              <label>💧 Humedad (%)</label>
              <input type="number" [(ngModel)]="humidity"
                min="0" max="100" />
            </div>
            <div class="form-group">
              <label>🔵 Presión (hPa)</label>
              <input type="number" [(ngModel)]="pressure"
                min="500" max="900" />
            </div>
            <div class="form-group">
              <label>🌧️ Lluvia activa</label>
              <select [(ngModel)]="rainfall">
                <option [ngValue]="true">Sí</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-dark preview-card">
          <h2>Vista previa</h2>
          <div class="preview-content" *ngIf="selectedCondition">
            <span class="preview-icon">
              {{ getConditionIcon(selectedCondition) }}
            </span>
            <div class="preview-values">
              <span>🌡️ {{ temperature }}°C</span>
              <span>💧 {{ humidity }}%</span>
              <span>🔵 {{ pressure }} hPa</span>
              <span>🌧️ {{ rainfall ? 'Lluvia activa' : 'Sin lluvia' }}</span>
            </div>
          </div>
          <p *ngIf="!selectedCondition" class="no-preview">
            Selecciona una condición para ver la vista previa
          </p>

          <p class="success-message" *ngIf="successMsg">{{ successMsg }}</p>
          <p class="error-message" *ngIf="errorMsg">{{ errorMsg }}</p>

          <button class="btn-primary btn-send"
            (click)="sendReading()"
            [disabled]="loading || !selectedNodeId || !selectedCondition">
            {{ loading ? 'Enviando...' : '📡 Enviar lectura' }}
          </button>
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
      margin-bottom: 32px;
    }
    .simulator-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .selector-card, .conditions-card,
    .values-card, .preview-card {
      padding: 28px;
    }
    .node-select {
      width: 100%;
      margin-top: 16px;
      padding: 12px 16px;
      background-color: #0f3460;
      color: #fefefe;
      border: 2px solid rgba(254,195,0,0.3);
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .condition-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    .condition-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      background-color: #0f3460;
      border: 2px solid transparent;
      border-radius: 12px;
      color: #fefefe;
      cursor: pointer;
      transition: all 0.2s;
    }
    .condition-btn:hover {
      border-color: rgba(254,195,0,0.4);
      transform: translateY(-2px);
    }
    .condition-btn.selected {
      border-color: #fec300;
      background-color: rgba(254,195,0,0.15);
    }
    .btn-icon { font-size: 2rem; }
    .btn-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #fdc302;
    }
    .values-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .form-group label {
      color: #fdc302;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 6px;
      display: block;
    }
    input[type="number"], select {
      width: 100%;
      padding: 10px 12px;
      background-color: #0f3460;
      color: #fefefe;
      border: 2px solid rgba(254,195,0,0.2);
      border-radius: 8px;
      font-size: 0.95rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #fec300;
    }
    .preview-content {
      display: flex;
      align-items: center;
      gap: 24px;
      margin: 16px 0 24px;
    }
    .preview-icon { font-size: 4rem; }
    .preview-values {
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #fefefe;
      font-size: 0.95rem;
    }
    .no-preview {
      color: rgba(255,255,255,0.4);
      font-size: 0.9rem;
      margin: 16px 0 24px;
    }
    .btn-send {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
      margin-top: 8px;
    }
    .btn-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .success-message {
      color: #44bb44;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    .error-message {
      color: #ff4444;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
  `]
})
export class SimulatorComponent implements OnInit {
  nodes: Node[] = [];
  selectedNodeId = '';
  selectedCondition = '';
  temperature = 15;
  humidity = 75;
  pressure = 747;
  rainfall = false;
  loading = false;
  successMsg = '';
  errorMsg = '';

  conditions = [
    { value: 'rain',   label: 'Lluvia',   icon: '🌧️' },
    { value: 'sun',    label: 'Soleado',  icon: '☀️' },
    { value: 'cold',   label: 'Frío',     icon: '🥶' },
    { value: 'cloudy', label: 'Nublado',  icon: '☁️' },
    { value: 'fog',    label: 'Niebla',   icon: '🌫️' }
  ];

  constructor(
    private readingService: ReadingService,
    private nodeService: NodeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nodeService.getAll().subscribe({
      next: res => this.nodes = res.nodes,
      error: () => {}
    });
  }

  selectCondition(c: { value: string; label: string; icon: string }) {
    this.selectedCondition = c.value;
    const defaults: Record<string, any> = {
      rain:   { temperature: 13, humidity: 88, pressure: 743, rainfall: true  },
      sun:    { temperature: 22, humidity: 45, pressure: 755, rainfall: false },
      cold:   { temperature:  5, humidity: 70, pressure: 748, rainfall: false },
      cloudy: { temperature: 16, humidity: 72, pressure: 749, rainfall: false },
      fog:    { temperature: 11, humidity: 92, pressure: 745, rainfall: false }
    };
    const d = defaults[c.value];
    if (d) {
      this.temperature = d.temperature;
      this.humidity    = d.humidity;
      this.pressure    = d.pressure;
      this.rainfall    = d.rainfall;
    }
  }

  getConditionIcon(condition: string): string {
    const icons: Record<string, string> = {
      rain: '🌧️', sun: '☀️', cold: '🥶', cloudy: '☁️', fog: '🌫️'
    };
    return icons[condition] || '🌡️';
  }

  sendReading() {
    if (!this.selectedNodeId || !this.selectedCondition) return;
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.readingService.create({
      nodeId: this.selectedNodeId,
      temperature: this.temperature,
      humidity: this.humidity,
      pressure: this.pressure,
      rainfall: this.rainfall,
      condition: this.selectedCondition as any
    }).subscribe({
      next: () => {
        this.successMsg = '✅ Lectura enviada correctamente';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error al enviar la lectura';
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

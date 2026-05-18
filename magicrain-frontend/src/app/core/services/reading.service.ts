import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reading } from '../models/reading.model';

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLatest(): Observable<{ reading: Reading }> {
    return this.http.get<{ reading: Reading }>(`${this.apiUrl}/readings/latest`);
  }

  getAll(filters?: { nodeId?: string; condition?: string; startDate?: string; endDate?: string }): Observable<{ total: number; readings: Reading[] }> {
    let params = new HttpParams();
    if (filters?.nodeId)    params = params.set('nodeId', filters.nodeId);
    if (filters?.condition) params = params.set('condition', filters.condition);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate)   params = params.set('endDate', filters.endDate);
    return this.http.get<{ total: number; readings: Reading[] }>(`${this.apiUrl}/readings`, { params });
  }

  getById(id: string): Observable<{ reading: Reading }> {
    return this.http.get<{ reading: Reading }>(`${this.apiUrl}/readings/${id}`);
  }

  create(data: Partial<Reading>): Observable<any> {
    return this.http.post(`${this.apiUrl}/readings`, data);
  }

  update(id: string, data: Partial<Reading>): Observable<any> {
    return this.http.put(`${this.apiUrl}/readings/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/readings/${id}`);
  }
}

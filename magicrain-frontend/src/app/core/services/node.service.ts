import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Node } from '../models/node.model';

@Injectable({ providedIn: 'root' })
export class NodeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ nodes: Node[] }> {
    return this.http.get<{ nodes: Node[] }>(`${this.apiUrl}/nodes`);
  }

  getById(id: string): Observable<{ node: Node }> {
    return this.http.get<{ node: Node }>(`${this.apiUrl}/nodes/${id}`);
  }

  create(data: Partial<Node>): Observable<any> {
    return this.http.post(`${this.apiUrl}/nodes`, data);
  }

  update(id: string, data: Partial<Node>): Observable<any> {
    return this.http.put(`${this.apiUrl}/nodes/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/nodes/${id}`);
  }
}

import { Injectable, signal } from '@angular/core';
import { Captador } from '../models/captador.model';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CaptadorService {

  private readonly api = 'http://localhost:8080/captadores';

  constructor(private httpClient: HttpClient) { }

  public refreshTrigger = signal(0);

  private notifyUpdate() {
    this.refreshTrigger.update(v => v + 1);
  }

  create(captador: Captador): Observable<Captador> {
    return this.httpClient.post<Captador>(this.api, captador).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  update(captador: Captador): Observable<Captador> {
    return this.httpClient.put<Captador>(`${this.api}/${captador.id}`, captador).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // Buscar todos com paginação
  findAll(page?: number, pageSize?: number): Observable<Captador[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }
    return this.httpClient.get<Captador[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  searchByName(name: string, page?: number, pageSize?: number): Observable<Captador[]> {
    let params = new HttpParams().set('query', name);
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }
    return this.httpClient.get<Captador[]>(`${this.api}/search`, { params });
  }

  findById(id: number): Observable<Captador> {
    return this.httpClient.get<Captador>(`${this.api}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

}

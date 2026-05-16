import { Injectable, signal } from '@angular/core';
import { Baixocustom } from '../models/baixocustom.model';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BaixocustomService {

  private readonly api = 'http://localhost:8080/baixo-customizado';

  constructor(private httpClient: HttpClient) { }

  public refreshTrigger = signal(0);

  private notifyUpdate() {
    this.refreshTrigger.update(v => v + 1);
  }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Baixocustom[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }

    return this.httpClient.get<Baixocustom[]>(`${this.api}/buscarTodos`, { params }); 
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  searchByName(name: string, page?: number, pageSize?: number): Observable<Baixocustom[]> {

    let params = new HttpParams().set('query', name);

    if (page !== undefined && pageSize !== undefined) {

      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());

    }

   

    console.log('🔍 Requisição HTTP - searchByName:', {

      endpoint: `${this.api}/search`,

      params: { name, page, pageSize }

    });



    return this.httpClient.get<Baixocustom[]>(`${this.api}/search`, { params }).pipe(

      tap((response) => {

        console.log('✅ Resposta do Quarkus (searchByName):', response);

        console.log('📊 Total de resultados:', response.length);

      })

    );

  }

   //  Buscar por ID
  findById(id: any): Observable<Baixocustom> {
    return this.httpClient.get<Baixocustom>(`${this.api}/${id}`);
  }
  
  //  Criar
  create(baixocustom: Baixocustom): Observable<Baixocustom> {
    return this.httpClient.post<Baixocustom>(this.api, baixocustom).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  
  //  Atualizar
  update(baixocustom: Baixocustom): Observable<Baixocustom> {
    return this.httpClient.put<Baixocustom>(`${this.api}/${baixocustom.id}`, baixocustom).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

}

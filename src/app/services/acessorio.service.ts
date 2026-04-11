import { Injectable } from '@angular/core';
import { Acessorio } from '../models/acessorio.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AcessorioService {

  private readonly api = 'http://localhost:8080/Acessorio';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Acessorio[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }

    return this.httpClient.get<Acessorio[]>(`${this.api}/buscarTodos`, { params });
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  searchByName(name: string, page?: number, pageSize?: number): Observable<Acessorio[]> {

    let params = new HttpParams().set('query', name);

    if (page !== undefined && pageSize !== undefined) {

      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());

    }

   

    console.log('🔍 Requisição HTTP - searchByName:', {

      endpoint: `${this.api}/search`,

      params: { name, page, pageSize }

    });



    return this.httpClient.get<Acessorio[]>(`${this.api}/search`, { params }).pipe(

      tap((response) => {

        console.log('✅ Resposta do Quarkus (searchByName):', response);

        console.log('📊 Total de resultados:', response.length);

      })

    );

  }

   //  Buscar por ID
  findById(id: any): Observable<Acessorio> {
    return this.httpClient.get<Acessorio>(`${this.api}/${id}`);
  }
  
  //  Criar
  create(acessorio: Acessorio): Observable<Acessorio> {
    return this.httpClient.post<Acessorio>(this.api, acessorio);
  }
  
  //  Atualizar
  update(acessorio: Acessorio): Observable<Acessorio> {
    return this.httpClient.put<Acessorio>(`${this.api}/${acessorio.id}`, acessorio);
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
  

}




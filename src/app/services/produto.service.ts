import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Produto } from '../models/produto.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly api = 'http://localhost:8080/produto';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Produto[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }

    return this.httpClient.get<Produto[]>(`${this.api}/buscarTodos`, { params }); 
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  searchByName(name: string, page?: number, pageSize?: number): Observable<Produto[]> {

    let params = new HttpParams().set('query', name);

    if (page !== undefined && pageSize !== undefined) {

      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());

    }

   

    console.log('🔍 Requisição HTTP - searchByName:', {

      endpoint: `${this.api}/search`,

      params: { name, page, pageSize }

    });



    return this.httpClient.get<Produto[]>(`${this.api}/search`, { params }).pipe(

      tap((response) => {

        console.log('✅ Resposta do Quarkus (searchByName):', response);

        console.log('📊 Total de resultados:', response.length);

      })

    );

  }

   //  Buscar por ID
  findById(id: any): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.api}/${id}`);
  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Baixo } from '../models/baixo.model';


@Injectable({
  providedIn: 'root',
})
export class BaixoService {

  private readonly api = 'http://localhost:8080/baixo';

  constructor(private httpClient: HttpClient) { }

  //  Buscar todos
  findAll(page?: number, pageSize?: number): Observable<Baixo[]> {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());
    }

    return this.httpClient.get<Baixo[]>(`${this.api}/buscarTodos`, { params }); 
  }

  count(): Observable<any> {
    return this.httpClient.get<any>(`${this.api}/count`);
  }

  searchByName(name: string, page?: number, pageSize?: number): Observable<Baixo[]> {

    let params = new HttpParams().set('query', name);

    if (page !== undefined && pageSize !== undefined) {

      params = params.set('page', page.toString()).set('pageSize', pageSize.toString());

    }

   

    console.log('🔍 Requisição HTTP - searchByName:', {

      endpoint: `${this.api}/search`,

      params: { name, page, pageSize }

    });



    return this.httpClient.get<Baixo[]>(`${this.api}/search`, { params }).pipe(

      tap((response) => {

        console.log('✅ Resposta do Quarkus (searchByName):', response);

        console.log('📊 Total de resultados:', response.length);

      })

    );

  }

   //  Buscar por ID
  findById(id: any): Observable<Baixo> {
    return this.httpClient.get<Baixo>(`${this.api}/${id}`);
  }
  
  //  Criar
  create(baixo: Baixo): Observable<Baixo> {
    return this.httpClient.post<Baixo>(this.api, baixo);
  }
  
  //  Atualizar
  update(baixo: Baixo): Observable<Baixo> {
    return this.httpClient.put<Baixo>(`${this.api}/${baixo.id}`, baixo);
  }
  //  Deletar
  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
  

}




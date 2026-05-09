import { Injectable } from '@angular/core';
import { ConfiguracaoEletronica } from '../models/configuracao-eletronica.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracaoEletronicaService {

  private readonly api = 'http://localhost:8080/configuracao-eletronica';

  constructor(private httpClient: HttpClient) { }

  //  Criar
  create(configuracaoEletronica: ConfiguracaoEletronica): Observable<ConfiguracaoEletronica> {
    return this.httpClient.post<ConfiguracaoEletronica>(this.api, configuracaoEletronica);
  }

  //  Atualizar
  update(configuracaoEletronica: ConfiguracaoEletronica): Observable<ConfiguracaoEletronica> {
    return this.httpClient.put<ConfiguracaoEletronica>(`${this.api}/${configuracaoEletronica.id}`, configuracaoEletronica);
  }

}

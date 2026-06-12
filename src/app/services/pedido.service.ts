import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDTO, PedidoResponseDTO } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/pedido';

  criarPedido(pedido: PedidoDTO): Observable<PedidoResponseDTO> {
    return this.http.post<PedidoResponseDTO>(this.apiUrl, pedido);
  }

  getMyPedidos(): Observable<PedidoResponseDTO[]> {
    return this.http.get<PedidoResponseDTO[]>(`${this.apiUrl}/me`);
  }
}

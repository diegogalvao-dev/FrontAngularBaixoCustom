import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Produto } from '../models/produto.model';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private items = signal<Produto[]>([]);

  public readonly wishlistItems = this.items.asReadonly();

  public readonly totalItens = computed(() => this.items().length);

  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  private readonly baseUrl = 'http://localhost:8080/favoritos';

  constructor() {
    effect(() => {
      const token = this.authService.token();
      if (token) {
        this.carregarDoBackend();
      } else {
        this.items.set([]);
      }
    }, { allowSignalWrites: true });
  }

  async toggleFavorito(produto: Produto): Promise<void> {
    if (!this.authService.logado()) {
      this.router.navigate(['/login']);
      return;
    }
    const isFav = this.isFavorito(produto.id);
    
    // Otimista
    this.items.update(itens => 
      isFav ? itens.filter(i => i.id !== produto.id) : [...itens, produto]
    );

    try {
      if (isFav) {
        await firstValueFrom(this.http.delete(`${this.baseUrl}/${produto.id}`));
      } else {
        await firstValueFrom(this.http.post(`${this.baseUrl}/${produto.id}`, {}));
      }
    } catch (error) {
      console.error('Erro ao alternar favorito', error);
      // Rollback
      this.carregarDoBackend();
    }
  }

  async adicionarFavorito(produto: Produto): Promise<void> {
    if (!this.authService.logado()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.isFavorito(produto.id)) return;

    this.items.update(itens => [...itens, produto]);
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/${produto.id}`, {}));
    } catch (error) {
      console.error('Erro ao adicionar favorito', error);
      this.carregarDoBackend();
    }
  }

  async removerFavorito(produtoId: number): Promise<void> {
    this.items.update(itensAtuais => itensAtuais.filter(item => item.id !== produtoId));
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${produtoId}`));
    } catch (error) {
      console.error('Erro ao remover favorito', error);
      this.carregarDoBackend();
    }
  }

  isFavorito(produtoId: number): boolean {
    return this.items().some(item => item.id === produtoId);
  }

  limparWishlist(): void {
    // Para simplificar, poderíamos iterar e remover todos, mas vamos apenas limpar local
    this.items.set([]);
  }

  private async carregarDoBackend(): Promise<void> {
    try {
      const favoritos = await firstValueFrom(this.http.get<Produto[]>(this.baseUrl));
      this.items.set(favoritos || []);
    } catch (error) {
      console.error('Erro ao buscar favoritos do backend', error);
      this.items.set([]);
    }
  }
}

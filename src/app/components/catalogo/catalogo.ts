import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';
import { ArquivoService } from '../../services/arquivo.service';
import { Produto } from '../../models/produto.model';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  readonly authService = inject(AuthService);
  public wishlistService = inject(WishlistService);
  produtos = signal<Produto[]>([]);
  paginaAtual = signal(0);
  itensPorPagina = 12;
  searchTerm = signal('');
  page = 0;
  pageSize = 12;
  totalRecords = signal(0);

  toggleFavorito(produto: Produto, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggleFavorito(produto);
  }
  
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortOrder = signal('maisVendidos');

  constructor(
    private produtoService: ProdutoService,
    public arquivoService: ArquivoService
  ) {
    effect(() => {
      const term = this.searchTerm();
      const page = this.paginaAtual();
      const pageSize = this.itensPorPagina;
      const min = this.minPrice();
      const max = this.maxPrice();
      const sort = this.sortOrder();
      untracked(() => {
        this.loadData(term, min, max, sort, page, pageSize);
      });
    });
  }

  ngOnInit(): void {
  }

  loadData(term: string, min: number | null, max: number | null, sort: string, page: number, pageSize: number) {
    this.produtoService.buscarComFiltros(term, min, max, sort, page, pageSize).subscribe({
      next: (items) => {
        this.produtos.set(items);
        this.totalRecords.set(items.length);
      },
      error: (error) => {
        console.error('Erro ao buscar produtos com filtros', error);
      }
    });
  }

  mudarPagina(p: number, event: Event) {
    event.preventDefault();
    this.paginaAtual.set(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  searchByName(name: string): void {
    this.searchTerm.set(name?.trim() ?? '');
    this.paginaAtual.set(0);
  } 

  aplicarFiltroPreco(min: string, max: string): void {
    const valMin = min ? parseFloat(min) : null;
    const valMax = max ? parseFloat(max) : null;
    this.minPrice.set(valMin);
    this.maxPrice.set(valMax);
    this.paginaAtual.set(0);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortOrder.set(select.value);
    this.paginaAtual.set(0);
  }

}

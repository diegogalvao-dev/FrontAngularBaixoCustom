import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdutoService } from '../../services/produto.service';
import { ArquivoService } from '../../services/arquivo.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  produtos = signal<Produto[]>([]);
  paginaAtual = signal(0);
  itensPorPagina = 12;

  constructor(
    private produtoService: ProdutoService,
    public arquivoService: ArquivoService
  ) {}

  ngOnInit() {
    this.carregarProdutos();
  }

  carregarProdutos() {
    this.produtoService.findAll(this.paginaAtual(), this.itensPorPagina).subscribe({
      next: (data) => this.produtos.set(data),
      error: (err) => console.error('Erro ao carregar catálogo:', err)
    });
  }

  mudarPagina(p: number, event: Event) {
    event.preventDefault();
    this.paginaAtual.set(p);
    this.carregarProdutos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

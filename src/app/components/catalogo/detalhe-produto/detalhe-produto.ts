import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProdutoService } from '../../../services/produto.service';
import { ArquivoService } from '../../../services/arquivo.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { WishlistService } from '../../../services/wishlist.service';
import { Produto } from '../../../models/produto.model';

@Component({
  selector: 'app-detalhe-produto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhe-produto.html',
  styleUrl: './detalhe-produto.css'
})
export class DetalheProduto implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  public arquivoService = inject(ArquivoService);
  private carrinhoService = inject(CarrinhoService);
  public wishlistService = inject(WishlistService);

  produto = signal<Produto | null>(null);
  imagemSelecionada = signal<string | null>(null);
  produtosRelacionados = signal<Produto[]>([]);
  exibirPopup = signal<boolean>(false);
  private popupTimeout: any = null;

  toggleFavorito(): void {
    const prod = this.produto();
    if (prod) {
      this.wishlistService.toggleFavorito(prod);
    }
  }

  ngOnInit(): void {
    // Monitora as mudanças de parâmetro de rota para atualizar a página quando o usuário clica em um produto relacionado
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carregarProduto(Number(id));
      }
    });
  }

  carregarProduto(id: number): void {
    this.produtoService.findById(id).subscribe({
      next: (prod) => {
        this.produto.set(prod);
        // Define a imagem principal inicialmente
        if (prod.imagemPrincipal) {
          this.imagemSelecionada.set(this.arquivoService.getUrlDownload(prod.imagemPrincipal));
        } else {
          this.imagemSelecionada.set(null);
        }
        this.carregarProdutosRelacionados(id);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do produto:', err);
      }
    });
  }

  carregarProdutosRelacionados(currentId: number): void {
    // Busca todos para extrair 3 produtos aleatórios diferentes do atual
    this.produtoService.findAll(0, 100).subscribe({
      next: (lista) => {
        const filtrados = lista.filter(p => p.id !== currentId);
        // Embaralha e pega 3
        const embaralhados = filtrados.sort(() => 0.5 - Math.random());
        this.produtosRelacionados.set(embaralhados.slice(0, 3));
      },
      error: (err) => {
        console.error('Erro ao carregar produtos relacionados:', err);
      }
    });
  }

  selecionarImagem(img: string): void {
    this.imagemSelecionada.set(this.arquivoService.getUrlDownload(img));
  }

  adicionarAoCarrinho(irDireto: boolean = false): void {
    const prod = this.produto();
    if (prod) {
      this.carrinhoService.adicionarProduto(prod);
      
      if (irDireto) {
        this.router.navigate(['/carrinho']);
      } else {
        // Mostra o popup temporário
        this.exibirPopup.set(true);
        
        // Limpa o timeout anterior se houver
        if (this.popupTimeout) {
          clearTimeout(this.popupTimeout);
        }
        
        // Esconde o popup após 4 segundos
        this.popupTimeout = setTimeout(() => {
          this.exibirPopup.set(false);
        }, 4000);
      }
    }
  }

  solicitarCustomizacao(): void {
    this.router.navigate(['/admin/baixo-custom']);
  }
}


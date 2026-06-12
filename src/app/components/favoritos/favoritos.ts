import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { ArquivoService } from '../../services/arquivo.service';
import { Produto } from '../../models/produto.model';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent {
  public wishlistService = inject(WishlistService);
  public carrinhoService = inject(CarrinhoService);
  public arquivoService = inject(ArquivoService);

  removerFavorito(produtoId: number): void {
    this.wishlistService.removerFavorito(produtoId);
  }

  reservarAgora(produto: Produto): void {
    this.carrinhoService.adicionarProduto(produto);
    this.wishlistService.removerFavorito(produto.id);
  }
}

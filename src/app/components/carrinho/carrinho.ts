import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';
import { ArquivoService } from '../../services/arquivo.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class CarrinhoComponent {
  public carrinhoService = inject(CarrinhoService);
  public arquivoService = inject(ArquivoService);

  aumentarQuantidade(itemId: number, quantidadeAtual: number, isCustom: boolean = false) {
    this.carrinhoService.atualizarQuantidade(itemId, isCustom, quantidadeAtual + 1);
  }

  diminuirQuantidade(itemId: number, quantidadeAtual: number, isCustom: boolean = false) {
    this.carrinhoService.atualizarQuantidade(itemId, isCustom, quantidadeAtual - 1);
  }

  removerItem(itemId: number, isCustom: boolean = false) {
    this.carrinhoService.removerItem(itemId, isCustom);
  }
}

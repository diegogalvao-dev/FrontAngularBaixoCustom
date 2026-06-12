import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, NgIf } from '@angular/common';
import { CarrinhoService } from '../../services/carrinho.service';
import { PedidoService } from '../../services/pedido.service';
import { PedidoDTO, ItemCarrinhoDTO } from '../../models/pedido.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink, NgIf],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent {
  public carrinhoService = inject(CarrinhoService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  // Form fields
  endereco = '';
  cidade = '';
  estado = '';
  cep = '';
  metodoPagamento = 'cartao';

  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  finalizarPedido() {
    if (!this.endereco || !this.cidade || !this.estado || !this.cep) {
      this.errorMessage.set('Por favor, preencha todos os campos de envio.');
      return;
    }

    if (this.carrinhoService.carrinhoItems().length === 0) {
      this.errorMessage.set('Seu carrinho está vazio.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const enderecoCompleto = `${this.endereco}, ${this.cidade} - ${this.estado}, ${this.cep}`;
    const itemsDto: ItemCarrinhoDTO[] = this.carrinhoService.carrinhoItems().map(item => ({
      produtoId: item.produto ? item.produto.id : undefined,
      baixoCustomizadoId: item.baixocustom ? item.baixocustom.id : undefined,
      quantidade: item.quantidade,
      precoUnitario: item.produto ? item.produto.price : (item.baixocustom?.price || 0)
    }));

    const novoPedido: PedidoDTO = {
      data: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      valortotal: this.carrinhoService.subtotal(),
      pedidoItemList: itemsDto,
      enderecoEnvio: enderecoCompleto,
      metodoPagamento: this.metodoPagamento,
      // pessoaCliente is optional/omitted for now since we may not have auth wired up fully in frontend yet, or if it errors, we can mock it
      // pessoaCliente: 1 // mock
    };

    this.pedidoService.criarPedido(novoPedido).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Pedido realizado com sucesso! ID: ' + res.id);
        this.carrinhoService.limparCarrinho(); // clear cart
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Erro ao criar pedido:', err);
        this.errorMessage.set('Ocorreu um erro ao processar seu pedido. Tente novamente.');
      }
    });
  }
}

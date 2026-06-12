import { Injectable, signal, computed } from '@angular/core';
import { Produto } from '../models/produto.model';
import { Baixocustom } from '../models/baixocustom.model';

export interface ItemCarrinho {
  produto?: Produto;
  baixocustom?: Baixocustom;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  // Using signals for reactive state management
  private items = signal<ItemCarrinho[]>([]);

  // Computed signals for easy access to derived state
  public readonly carrinhoItems = this.items.asReadonly();
  
  public readonly totalItens = computed(() => {
    return this.items().reduce((acc, item) => acc + item.quantidade, 0);
  });

  public readonly subtotal = computed(() => {
    return this.items().reduce((acc, item) => {
      const price = item.produto ? item.produto.price : (item.baixocustom?.price || 0);
      return acc + (price * item.quantidade);
    }, 0);
  });

  constructor() {
    this.carregarDoLocalStorage();
  }

  adicionarProduto(produto: Produto, quantidade: number = 1): void {
    this.items.update(itensAtuais => {
      const itemExistente = itensAtuais.find(i => i.produto && i.produto.id === produto.id);
      
      if (itemExistente) {
        // Se já existe, atualiza a quantidade
        return itensAtuais.map(i => 
          i.produto && i.produto.id === produto.id 
            ? { ...i, quantidade: i.quantidade + quantidade } 
            : i
        );
      }
      
      // Se não existe, adiciona o novo item
      return [...itensAtuais, { produto, quantidade }];
    });
    
    this.salvarNoLocalStorage();
  }

  adicionarBaixocustom(baixocustom: Baixocustom, quantidade: number = 1): void {
    this.items.update(itensAtuais => {
      // Baixos customizados costumam ser únicos por ID, mas se for o mesmo, incrementa
      const itemExistente = itensAtuais.find(i => i.baixocustom && i.baixocustom.id === baixocustom.id);
      
      if (itemExistente) {
        return itensAtuais.map(i => 
          i.baixocustom && i.baixocustom.id === baixocustom.id 
            ? { ...i, quantidade: i.quantidade + quantidade } 
            : i
        );
      }
      return [...itensAtuais, { baixocustom, quantidade }];
    });
    this.salvarNoLocalStorage();
  }

  removerItem(itemId: number, isCustom: boolean): void {
    this.items.update(itensAtuais => itensAtuais.filter(i => {
      if (isCustom) {
        return !(i.baixocustom && i.baixocustom.id === itemId);
      } else {
        return !(i.produto && i.produto.id === itemId);
      }
    }));
    this.salvarNoLocalStorage();
  }

  // Mantemos o removerProduto antigo para compatibilidade, ou usamos removerItem
  removerProduto(produtoId: number): void {
    this.removerItem(produtoId, false);
  }

  atualizarQuantidade(itemId: number, isCustom: boolean, novaQuantidade: number): void {
    if (novaQuantidade <= 0) {
      this.removerItem(itemId, isCustom);
      return;
    }

    this.items.update(itensAtuais => 
      itensAtuais.map(i => {
        const match = isCustom 
          ? (i.baixocustom && i.baixocustom.id === itemId) 
          : (i.produto && i.produto.id === itemId);
        
        return match ? { ...i, quantidade: novaQuantidade } : i;
      })
    );
    this.salvarNoLocalStorage();
  }

  limparCarrinho(): void {
    this.items.set([]);
    this.salvarNoLocalStorage();
  }

  private salvarNoLocalStorage(): void {
    try {
      localStorage.setItem('deeptone_carrinho', JSON.stringify(this.items()));
    } catch (e) {
      console.error('Erro ao salvar o carrinho no localStorage', e);
    }
  }

  private carregarDoLocalStorage(): void {
    try {
      const saved = localStorage.getItem('deeptone_carrinho');
      if (saved) {
        this.items.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Erro ao carregar o carrinho do localStorage', e);
    }
  }
}

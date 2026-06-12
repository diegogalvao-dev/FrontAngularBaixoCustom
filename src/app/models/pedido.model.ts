export interface ItemCarrinhoDTO {
  produtoId?: number;
  baixoCustomizadoId?: number;
  quantidade: number;
  precoUnitario: number;
}

export interface PedidoItemResponseDTO {
  id: number;
  quantidade: number;
  precoUnitario: number;
  produtoId: number;
  pedidoId: number;
}

export interface PedidoDTO {
  data: string;
  valortotal: number;
  pedidoItemList: ItemCarrinhoDTO[];
  pessoaCliente?: number;
  enderecoEnvio: string;
  metodoPagamento: string;
}

export interface PedidoResponseDTO {
  id: number;
  data: string;
  valorTotal: number;
  metodoPagamento: string;
  enderecoEnvio: string;
  itens: PedidoItemResponseDTO[];
  usuarioClienteId: number;
}

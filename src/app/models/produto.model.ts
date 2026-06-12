export class Produto {

    id!: number;
    name!: string;
    price!: number;
    quantidadeEstoque!: number;
    fornecedor!: string;
    nomeImagens?: string[];
    imagemPrincipal!: string;
    type?: string;
    baixoModeloBase?: string;
    numeroCordas?: number;
    baixoCor?: string;
    acessorioTipo?: string;
    material?: string;
    tamanho?: number;

}

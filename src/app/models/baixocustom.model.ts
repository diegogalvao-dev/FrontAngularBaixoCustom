export class Baixocustom {

    id!: number;
    name!: string;
    price!: number;
    baixoModeloBase!: string;
    description!: string;
    baixoCor!: string;
    configuracaoEletronica!: number;
    captadorList!: number[];
    baixoStatus!: string;
    usuarioLuthier!: number;
    nomeImagens?: string[];

    // Alias para compatibilidade
    get pessoaLuthier(): number { return this.usuarioLuthier; }
    set pessoaLuthier(v: number) { this.usuarioLuthier = v; }

}

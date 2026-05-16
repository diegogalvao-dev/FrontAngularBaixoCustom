export type CaptadorPosicao = 'BRANCO' | 'MEIO' | 'PONTE';

export class Captador {
    id!: number;
    marca!: string;
    price!: number;
    captadorPosicao!: CaptadorPosicao;
    type!: 'ativo' | 'passivo';

    // Campos específicos para Ativo
    possuiBateria?: boolean;
    possuiAmplificador?: boolean;

    // Campos específicos para Passivo
    resistencia?: number;
    numeroBobinas?: number;
}

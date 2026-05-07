import { ResolveFn } from '@angular/router';
import { Produto } from '../models/produto.model';
import { inject } from '@angular/core';
import { ProdutoService } from '../services/produto.service';

export const produtoResolver: ResolveFn<Produto> = (route, state) => {
  return inject(ProdutoService).findById(route.paramMap.get('id')!);
};
import { ResolveFn } from '@angular/router';
import { Baixo } from '../models/baixo.model';
import { BaixoService } from '../services/baixo.service';
import { inject } from '@angular/core';

export const baixoResolver: ResolveFn<Baixo> = (route, state) => {
  return inject(BaixoService).findById(route.paramMap.get('id')!);
};

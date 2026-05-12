import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Captador } from '../models/captador.model';
import { CaptadorService } from '../services/captador.service';

export const captadorResolver: ResolveFn<Captador> = (route, state) => {
  const id = route.paramMap.get('id');
  return inject(CaptadorService).findById(Number(id));
};

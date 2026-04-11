import { ResolveFn } from '@angular/router';
import { AcessorioService } from '../services/acessorio.service';
import { Acessorio } from '../models/acessorio.model';
import { inject } from '@angular/core';


export const acessorioResolver: ResolveFn<Acessorio> = (route, state) => {
  return inject(AcessorioService).findById(route.paramMap.get('id')!);
};
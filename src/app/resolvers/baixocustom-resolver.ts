import { ResolveFn } from '@angular/router';
import { BaixocustomService } from '../services/baixocustom.service';
import { inject } from '@angular/core';
import { Baixocustom } from '../models/baixocustom.model';

export const baixocustomResolver: ResolveFn<Baixocustom> = (route, state) => {
  return inject(BaixocustomService).findById(route.paramMap.get('id')!);
};

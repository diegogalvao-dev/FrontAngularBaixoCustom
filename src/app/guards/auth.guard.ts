import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rotas que requerem autenticação.
 * Aguarda o carregamento do usuário (caso o token já exista no localStorage)
 * antes de decidir se permite ou redireciona para /login.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureUsuarioCarregado().pipe(
    map(() => {
      if (authService.logado()) {
        return true;
      }

      // Preserva a URL de destino como query param para redirecionar após login
      return router.createUrlTree(['/login'], {
        queryParams: { redirectTo: state.url },
      });
    }),
  );
};

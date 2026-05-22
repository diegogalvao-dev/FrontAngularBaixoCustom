import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
} from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Busca os perfis configurados na rota atual ou em alguma rota pai
function routeRoles(route: ActivatedRouteSnapshot): string[] {
  for (const currentRoute of [...route.pathFromRoot].reverse()) {
    const roles = currentRoute.data['roles'];
    if (Array.isArray(roles)) {
      return roles.filter((role): role is string => typeof role === 'string');
    }
  }
  return [];
}

// Verifica se o usuário autenticado possui o perfil exigido pela rota
function hasRequiredRole(
  route: ActivatedRouteSnapshot,
  authService: AuthService,
): boolean {
  const perfil = authService.perfil()?.trim().toLowerCase();
  const roles = routeRoles(route).map((role) => role.trim().toLowerCase());

  if (roles.length === 0) {
    return authService.logado();
  }

  if (!perfil) {
    return false;
  }

  return roles.includes(perfil);
}

// Define o redirecionamento correto: sem autenticação → /login, sem permissão → /
function unauthorizedRedirect(
  route: ActivatedRouteSnapshot,
  authService: AuthService,
  router: Router,
) {
  if (!authService.logado()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        redirectTo: route.pathFromRoot
          .map((segment) => segment.url.map((item) => item.path).join('/'))
          .filter(Boolean)
          .join('/'),
      },
    });
  }
  return router.createUrlTree(['/']);
}

/**
 * Guard que protege a rota pai aguardando o carregamento do usuário
 * antes de validar autenticação e perfil.
 * Uso: canActivate: [roleGuard], data: { roles: ['Adm'] }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureUsuarioCarregado().pipe(
    map(() => {
      if (hasRequiredRole(route, authService)) {
        return true;
      }
      return unauthorizedRedirect(route, authService, router);
    }),
  );
};

/**
 * Guard que aplica a mesma validação de perfil para cada rota filha da área protegida.
 */
export const roleChildGuard: CanActivateChildFn = (childRoute) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureUsuarioCarregado().pipe(
    map(() => {
      if (hasRequiredRole(childRoute, authService)) {
        return true;
      }
      return unauthorizedRedirect(childRoute, authService, router);
    }),
  );
};

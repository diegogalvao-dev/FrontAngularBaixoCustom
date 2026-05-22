import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isBackendRequest = req.url.startsWith('http://localhost:8080');
  const isLoginRequest = req.url === 'http://localhost:8080/auth/login';

  // Não adiciona header em requests externas ou no próprio login
  if (!isBackendRequest || isLoginRequest) {
    return next(req);
  }

  const authorization = authService.authorizationValue();

  if (!authorization) {
    return next(req);
  }

  // Injeta o token JWT em todas as requisições para o backend
  return next(
    req.clone({
      setHeaders: {
        Authorization: authorization,
      },
    })
  );
};

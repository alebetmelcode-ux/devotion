import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Excluir endpoints públicos
  if (
    req.url.includes('/Usuario/login') ||
    req.url.includes('/Usuario/registro')
  ) {
    return next(req);
  }

  const sesion = localStorage.getItem('sesion');
  if (!sesion) {
    return next(req);
  }

  const { token } = JSON.parse(sesion);

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

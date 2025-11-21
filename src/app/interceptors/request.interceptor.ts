import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage-service';

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.token;

  if (!token) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

  return next(authorizedRequest);
};



import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage-service';

export const publicGuard: CanActivateFn = (route, state) => {
    const storageService = inject(StorageService);
    const router = inject(Router);
    if (storageService.token) {
        router.navigate(['/home']);
        return false;
    }
    return true;
};

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage-service';

export const writerGuard: CanActivateFn = (route, state) => {
    const storageService = inject(StorageService);
    const router = inject(Router);
    const user = storageService.userProfile();
    
    if (!storageService.token) {
        router.navigate(['/login']);
        return false;
    }
    
    if (user?.role !== 'admin' && user?.role !== 'writer') {
        router.navigate(['/home']);
        return false;
    }
    
    return true;
};


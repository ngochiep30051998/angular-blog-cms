import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth-guard';

export const privateRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./private-layout').then(
                (m) => m.PrivateLayout
            ),
        children: [
            {
                path: 'home',
                loadComponent: () =>
                    import('../../pages/home/home').then(
                        (m) => m.Home),
            }
        ],
        canActivate: [authGuard]
    }
]
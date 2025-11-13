import { Routes } from "@angular/router";
import { publicGuard } from "../../guards/public-guard";

export const publicRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./public-layout').then(
                (m) => m.PublicLayout
            ),
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('../../pages/login/login').then(
                        (m) => m.Login
                    ),
            }
        ],
        canActivate: [publicGuard]
    },
]
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
            },
            {
                path: 'categories',
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('../../pages/categories/list/categories-list').then(
                                (m) => m.CategoriesList),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import('../../pages/categories/create/category-create').then(
                                (m) => m.CategoryCreate),
                    },
                    {
                        path: ':categoryId/edit',
                        loadComponent: () =>
                            import('../../pages/categories/edit/category-edit').then(
                                (m) => m.CategoryEdit),
                    },
                ],
            }
        ],
        canActivate: [authGuard]
    }
]
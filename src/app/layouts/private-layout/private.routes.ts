import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth-guard';
import { adminGuard } from '../../guards/admin-guard';

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
            },
            {
                path: 'profile',
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('../../pages/profile/profile').then(
                                (m) => m.Profile),
                    },
                    {
                        path: 'edit',
                        loadComponent: () =>
                            import('../../pages/profile/edit/profile-edit').then(
                                (m) => m.ProfileEdit),
                    },
                    {
                        path: 'change-password',
                        loadComponent: () =>
                            import('../../pages/profile/change-password/change-password').then(
                                (m) => m.ChangePassword),
                    },
                ],
            },
            {
                path: 'users',
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import('../../pages/users/users-list').then(
                                (m) => m.UsersList),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import('../../pages/users/user-create').then(
                                (m) => m.UserCreate),
                    },
                ],
                canActivate: [adminGuard],
            },
        ],
        canActivate: [authGuard]
    }
]
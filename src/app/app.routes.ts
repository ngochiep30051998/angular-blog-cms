import { Routes } from '@angular/router';
import { publicRoutes } from './layouts/public-layout/public.routes';
import { privateRoutes } from './layouts/private-layout/private.routes';

export const routes: Routes = [
    ...privateRoutes,
    ...publicRoutes,
];

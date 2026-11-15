import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'category/all',
  },
  {
    path: 'category/:categoryId',
    loadComponent: () => import('./core/features/catalog/catalog').then((m) => m.CatalogComponent),
  },
  {
    path: 'play/:slug',
    loadComponent: () =>
      import('./core/features/game-player/game-player').then((m) => m.GamePlayerComponent),
  },
  {
    path: '**',
    redirectTo: 'category/all',
  },
];

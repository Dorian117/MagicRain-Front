import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'admin/simulator',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/simulator/simulator.component').then(m => m.SimulatorComponent)
  },
  {
    path: 'admin/nodes',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/nodes/nodes.component').then(m => m.NodesComponent)
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'admin/readings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/readings/readings.component').then(m => m.ReadingsComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

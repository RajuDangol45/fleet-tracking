import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: []
  },
  // {
  //   path: 'driver',
  //   loadChildren: () => import('./features/driver/driver.routes').then(m => m.driverRoutes)
  // }
];

import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { MasterDataComponent } from './features/admin/master-data/master-data.component';
import { HubsListComponent } from './features/admin/master-data/hubs/hubs-list.component';
import { HubFormComponent } from './features/admin/master-data/hubs/hub-form.component';
import { DriversListComponent } from './features/admin/master-data/drivers/drivers-list.component';
import { DriverFormComponent } from './features/admin/master-data/drivers/driver-form.component';
import { VehiclesListComponent } from './features/admin/master-data/vehicles/vehicles-list.component';
import { VehicleFormComponent } from './features/admin/master-data/vehicles/vehicle-form.component';
import { OrdersListComponent } from './features/admin/orders/orders-list.component';
import { OrderFormComponent } from './features/admin/orders/order-form.component';
import { VehicleAllocationComponent } from './features/admin/vehicle-allocation/vehicle-allocation.component';
import { FleetMapComponent } from './features/admin/fleet-map/fleet-map.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    children: [
      {
        path: '',
        component: AdminDashboardComponent
      },
      {
        path: 'master-data',
        component: MasterDataComponent,
        children: [
          {
            path: '',
            redirectTo: 'hubs',
            pathMatch: 'full'
          },
          {
            path: 'hubs',
            component: HubsListComponent
          },
          {
            path: 'hubs/create',
            component: HubFormComponent
          },
          {
            path: 'hubs/edit/:id',
            component: HubFormComponent
          },
          {
            path: 'drivers',
            component: DriversListComponent
          },
          {
            path: 'drivers/create',
            component: DriverFormComponent
          },
          {
            path: 'drivers/edit/:id',
            component: DriverFormComponent
          },
          {
            path: 'vehicles',
            component: VehiclesListComponent
          },
          {
            path: 'vehicles/create',
            component: VehicleFormComponent
          },
          {
            path: 'vehicles/edit/:id',
            component: VehicleFormComponent
          }
        ]
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            component: OrdersListComponent
          },
          {
            path: 'create',
            component: OrderFormComponent
          },
          {
            path: 'edit/:id',
            component: OrderFormComponent
          }
        ]
      },
      {
        path: 'vehicle-allocation',
        component: VehicleAllocationComponent
      },
      {
        path: 'fleet-map',
        component: FleetMapComponent
      }
    ]
  }
];

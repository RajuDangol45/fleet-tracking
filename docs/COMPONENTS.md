# Component Architecture

## Component Hierarchy

### Admin Dashboard
```
AdminDashboardComponent (root)
├── MasterDataManagement/
│   ├── DriversListComponent - Display/manage drivers
│   ├── DriverFormComponent - Create/edit driver forms
│   ├── VehiclesListComponent - Display/manage vehicles
│   ├── VehicleFormComponent - Create/edit vehicle forms
│   ├── HubsListComponent - Display/manage hubs/terminals
│   └── HubFormComponent - Create/edit hub forms
├── OrderManagement/
│   ├── OrdersListComponent - Display orders with filters
│   └── OrderFormComponent - Create/edit orders
├── VehicleAllocation/
│   └── VehicleAllocationComponent - Allocate vehicles to drivers
├── FleetMapComponent - Live fleet tracking map
└── InventoryDashboardComponent - Hub inventory overview
```

### Driver Interface
```
DriverDashboardComponent (root)
├── ShiftManagementComponent - Today's shift details
├── LiveMapComponent - Driver location & destinations
├── DeliveryManagementComponent - Mark deliveries complete/failed
└── ShiftHistoryComponent - Past shift records
```

## Component Responsibilities

**List Components**: Display data tables with search/filter, handle CRUD operations
**Form Components**: Reactive forms with validation, API integration
**Map Components**: Leaflet integration, real-time location updates
**Dashboard Components**: Data aggregation, navigation between features

## Shared Patterns
- All components use Angular standalone components
- ChangeDetectorRef for manual change detection
- Reactive forms with validation
- Error handling with user feedback
- Loading states during API calls
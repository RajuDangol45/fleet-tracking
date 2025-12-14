import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Driver, VehicleAllocation, Vehicle, Order, Hub } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-shift',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss']
})
export class ShiftComponent implements OnInit {
  currentDriver: Driver | null = null;
  todayAllocation: VehicleAllocation | null = null;
  assignedVehicle: Vehicle | null = null;
  assignedOrders: Order[] = [];
  destinations: Hub[] = [];
  
  loading: boolean = true;
  error: string = '';
  shiftStarted: boolean = false;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadShiftData();
  }

  loadShiftData() {
    this.loading = true;
    this.error = '';

    const currentDriverId = 'driver-1';

    forkJoin({
      drivers: this.apiService.getDrivers(),
      allocations: this.apiService.getVehicleAllocations(),
      vehicles: this.apiService.getVehicles(),
      orders: this.apiService.getOrders(),
      hubs: this.apiService.getHubs()
    }).subscribe({
      next: (data) => {
        this.currentDriver = data.drivers.find(d => d.id === currentDriverId) || null;
        this.destinations = data.hubs;
        
        this.todayAllocation = data.allocations.find(
          a => a.driverId === currentDriverId && a.date === this.getTodayString()
        ) || null;

        if (this.todayAllocation) {
          this.assignedVehicle = data.vehicles.find(
            v => v.id === this.todayAllocation!.vehicleId
          ) || null;

          this.assignedOrders = data.orders.filter(
            o => o.assignedDriverId === currentDriverId
          );
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load shift data';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading shift data:', error);
      }
    });
  }

  startShift() {
    if (this.todayAllocation && this.assignedVehicle) {
      this.shiftStarted = true;
    }
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getDestinationName(destinationId: string): string {
    const destination = this.destinations.find(h => h.id === destinationId);
    return destination ? destination.name : destinationId;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'in-transit': return 'status-in-transit';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }
}
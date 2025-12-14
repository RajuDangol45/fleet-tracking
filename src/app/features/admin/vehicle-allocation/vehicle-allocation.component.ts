import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleAllocation, Vehicle, Driver } from '../../../models';
import { ApiService } from '../../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-vehicle-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-allocation.component.html',
  styleUrls: ['./vehicle-allocation.component.scss']
})
export class VehicleAllocationComponent implements OnInit {
  allocations: VehicleAllocation[] = [];
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  filteredAllocations: VehicleAllocation[] = [];
  
  selectedDate: string = '';
  selectedVehicle: string = '';
  selectedDriver: string = '';
  
  filterDate: string = '';
  filterVehicle: string = '';
  filterDriver: string = '';
  
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {
    this.selectedDate = this.getTodayString();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    forkJoin({
      allocations: this.apiService.getVehicleAllocations(),
      vehicles: this.apiService.getVehicles(),
      drivers: this.apiService.getDrivers()
    }).subscribe({
      next: (data) => {
        this.allocations = data.allocations;
        this.vehicles = data.vehicles;
        this.drivers = data.drivers;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load data';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading data:', error);
      }
    });
  }

  applyFilters() {
    this.filteredAllocations = this.allocations.filter(allocation => {
      const matchesDate = !this.filterDate || allocation.date === this.filterDate;
      const matchesVehicle = !this.filterVehicle || allocation.vehicleId === this.filterVehicle;
      const matchesDriver = !this.filterDriver || allocation.driverId === this.filterDriver;
      return matchesDate && matchesVehicle && matchesDriver;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getTodayString(): string {
    return this.formatDate(new Date());
  }

  getVehicleName(vehicleId: string): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.registration : vehicleId;
  }

  getDriverName(driverId: string): string {
    const driver = this.drivers.find(d => d.id === driverId);
    return driver ? driver.name : driverId;
  }

  createAllocation() {
    if (!this.selectedDate || !this.selectedVehicle || !this.selectedDriver) {
      this.error = 'Please select date, vehicle, and driver';
      return;
    }

    // Check if allocation already exists
    const existingAllocation = this.allocations.find(
      a => a.date === this.selectedDate && a.vehicleId === this.selectedVehicle
    );

    if (existingAllocation) {
      this.error = 'Vehicle already allocated for this date';
      return;
    }

    const allocation: Omit<VehicleAllocation, 'id'> = {
      vehicleId: this.selectedVehicle,
      driverId: this.selectedDriver,
      date: this.selectedDate
    };

    this.apiService.createVehicleAllocation(allocation).subscribe({
      next: () => {
        this.loadData();
        this.selectedVehicle = '';
        this.selectedDriver = '';
        this.error = '';
      },
      error: (error) => {
        this.error = 'Failed to create allocation';
        console.error('Error creating allocation:', error);
      }
    });
  }

  deleteAllocation(id: string) {
    if (confirm('Are you sure you want to delete this allocation?')) {
      this.apiService.deleteVehicleAllocation(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          this.error = 'Failed to delete allocation';
          console.error('Error deleting allocation:', error);
        }
      });
    }
  }

  clearFilters() {
    this.filterDate = '';
    this.filterVehicle = '';
    this.filterDriver = '';
    this.applyFilters();
  }

  getTodayMinDate(): string {
    return this.getTodayString();
  }
}
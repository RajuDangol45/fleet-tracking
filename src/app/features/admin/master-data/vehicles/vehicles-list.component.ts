import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Vehicle } from '../../../../models';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss']
})
export class VehiclesListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  searchTerm: string = '';
  filterType: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load vehicles';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading vehicles:', error);
      }
    });
  }

  applyFilters() {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const matchesSearch = vehicle.registration.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           vehicle.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.filterType || vehicle.type === this.filterType;
      return matchesSearch && matchesType;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onTypeFilterChange() {
    this.applyFilters();
  }

  deleteVehicle(id: string) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.apiService.deleteVehicle(id).subscribe({
        next: () => {
          this.loadVehicles();
        },
        error: (error) => {
          this.error = 'Failed to delete vehicle';
          console.error('Error deleting vehicle:', error);
        }
      });
    }
  }
}
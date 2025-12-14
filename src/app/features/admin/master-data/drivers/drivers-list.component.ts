import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Driver } from '../../../../models';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './drivers-list.component.html',
  styleUrls: ['./drivers-list.component.scss']
})
export class DriversListComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDrivers();
  }

  loadDrivers() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load drivers';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading drivers:', error);
      }
    });
  }

  applyFilters() {
    this.filteredDrivers = this.drivers.filter(driver => {
      return driver.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             driver.license.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             driver.phone.includes(this.searchTerm);
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  deleteDriver(id: string) {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.apiService.deleteDriver(id).subscribe({
        next: () => {
          this.loadDrivers();
        },
        error: (error) => {
          this.error = 'Failed to delete driver';
          console.error('Error deleting driver:', error);
        }
      });
    }
  }
}
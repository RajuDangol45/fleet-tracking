import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ApiService } from '../../../services/api.service';
import { Driver, VehicleAllocation, Vehicle, Order } from '../../../models';
import { forkJoin, interval, Subscription } from 'rxjs';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

@Component({
  selector: 'app-fleet-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet-map.component.html',
  styleUrls: ['./fleet-map.component.scss'],
})
export class FleetMapComponent implements OnInit, OnDestroy {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private refreshSubscription: Subscription | null = null;

  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  allocations: VehicleAllocation[] = [];
  orders: Order[] = [];
  loading: boolean = true;
  error: string = '';

  filterDriver: string = '';
  filterVehicle: string = '';
  filterStatus: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
    this.setupMap();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  loadData() {
    this.loading = true;
    this.error = '';

    forkJoin({
      drivers: this.apiService.getDrivers(),
      vehicles: this.apiService.getVehicles(),
      allocations: this.apiService.getVehicleAllocations(),
      orders: this.apiService.getOrders()
    }).subscribe({
      next: (data) => {
        this.drivers = data.drivers;
        this.vehicles = data.vehicles;
        this.allocations = data.allocations;
        this.orders = data.orders;
        this.updateMapMarkers();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load fleet data';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading fleet data:', error);
      },
    });
  }

  setupMap() {
    this.map = L.map('fleet-map').setView([40.7128, -74.006], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.carto.com/">CARTO</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);
  }

  updateMapMarkers() {
    if (!this.map) return;

    this.clearMarkers();

    const filteredAllocations = this.getFilteredAllocations();

    filteredAllocations.forEach((allocation) => {
      const driver = this.drivers.find((d) => d.id === allocation.driverId);
      const vehicle = this.vehicles.find((v) => v.id === allocation.vehicleId);

      if (driver && vehicle) {
        const position = this.getRandomPosition();
        const marker = L.marker([position.lat, position.lng])
          .bindTooltip(`Driver: ${driver.name}`, {
            permanent: false,
            direction: 'top',
          })
          .addTo(this.map!);

        this.markers.push(marker);
      }
    });
  }

  getFilteredAllocations(): VehicleAllocation[] {
    let filtered = this.allocations.filter(
      (allocation) => allocation.date === this.getTodayString()
    );

    if (this.filterDriver) {
      filtered = filtered.filter(
        (allocation) => allocation.driverId === this.filterDriver
      );
    }

    if (this.filterVehicle) {
      filtered = filtered.filter(
        (allocation) => allocation.vehicleId === this.filterVehicle
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter((allocation) => {
        const order = this.orders.find(
          (o) => o.assignedDriverId === allocation.driverId
        );
        return order ? order.status === this.filterStatus : false;
      });
    }

    return filtered;
  }

  onFilterChange() {
    this.updateMapMarkers();
  }

  clearFilters() {
    this.filterDriver = '';
    this.filterVehicle = '';
    this.filterStatus = '';
    this.updateMapMarkers();
  }

  getRandomPosition(): { lat: number; lng: number } {
    const baseLatitude = 40.7128;
    const baseLongitude = -74.006;
    const range = 0.1;

    return {
      lat: baseLatitude + (Math.random() - 0.5) * range,
      lng: baseLongitude + (Math.random() - 0.5) * range,
    };
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.markers = [];
  }

  startAutoRefresh() {
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.updateMapMarkers();
    });
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  refreshMap() {
    this.loadData();
  }
}

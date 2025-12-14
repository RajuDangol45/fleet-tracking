import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ApiService } from '../../../services/api.service';
import { Driver, Order, Hub } from '../../../models';
import { forkJoin } from 'rxjs';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

@Component({
  selector: 'app-driver-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-map.component.html',
  styleUrls: ['./driver-map.component.scss']
})
export class DriverMapComponent implements OnInit, OnDestroy {
  private map: L.Map | null = null;
  private currentLocationMarker: L.Marker | null = null;
  private destinationMarkers: L.Marker[] = [];

  currentDriver: Driver | null = null;
  assignedOrders: Order[] = [];
  destinations: Hub[] = [];
  currentLocation: { lat: number, lng: number } = { lat: 40.7128, lng: -74.0060 };
  
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadMapData();
    this.setupMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadMapData() {
    this.loading = true;
    this.error = '';

    const currentDriverId = 'driver-1';

    forkJoin({
      drivers: this.apiService.getDrivers(),
      orders: this.apiService.getOrders(),
      hubs: this.apiService.getHubs()
    }).subscribe({
      next: (data) => {
        this.currentDriver = data.drivers.find(d => d.id === currentDriverId) || null;
        this.destinations = data.hubs;
        
        this.assignedOrders = data.orders.filter(
          o => o.assignedDriverId === currentDriverId && o.status !== 'completed'
        );

        this.updateMap();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load map data';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading map data:', error);
      }
    });
  }

  setupMap() {
    this.map = L.map('driver-map').setView([this.currentLocation.lat, this.currentLocation.lng], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.carto.com/">CARTO</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
  }

  updateMap() {
    if (!this.map) return;

    this.clearMarkers();
    this.addCurrentLocationMarker();
    this.addDestinationMarkers();
  }

  clearMarkers() {
    if (this.currentLocationMarker) {
      this.map!.removeLayer(this.currentLocationMarker);
    }
    
    this.destinationMarkers.forEach(marker => {
      this.map!.removeLayer(marker);
    });
    this.destinationMarkers = [];
  }

  addCurrentLocationMarker() {
    if (!this.map) return;

    this.currentLocationMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng])
      .bindTooltip('Your Current Location', {
        permanent: false,
        direction: 'top'
      })
      .addTo(this.map);
  }

  addDestinationMarkers() {
    if (!this.map) return;

    this.assignedOrders.forEach(order => {
      const destination = this.destinations.find(h => h.id === order.destinationId);
      
      if (destination) {
        const marker = L.marker([destination.coordinates.lat, destination.coordinates.lng])
          .bindTooltip(`${destination.name}`, {
            permanent: false,
            direction: 'top'
          })
          .addTo(this.map!);

        this.destinationMarkers.push(marker);
      }
    });
  }
}
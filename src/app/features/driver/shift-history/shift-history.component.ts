import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Driver, Order, Hub } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-shift-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shift-history.component.html',
  styleUrls: ['./shift-history.component.scss']
})
export class ShiftHistoryComponent implements OnInit {
  currentDriver: Driver | null = null;
  pastDeliveries: Order[] = [];
  destinations: Hub[] = [];
  
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadShiftHistory();
  }

  loadShiftHistory() {
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
        
        this.pastDeliveries = data.orders.filter((order: Order) => 
          order.assignedDriverId === currentDriverId && 
          order.status === 'completed'
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load shift history';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading shift history:', error);
      }
    });
  }

  getDestinationName(destinationId: string): string {
    const destination = this.destinations.find(h => h.id === destinationId);
    return destination ? destination.name : destinationId;
  }
}
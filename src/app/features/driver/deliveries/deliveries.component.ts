import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Driver, Order, Hub } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.scss']
})
export class DeliveriesComponent implements OnInit {
  currentDriver: Driver | null = null;
  assignedOrders: Order[] = [];
  destinations: Hub[] = [];
  
  loading: boolean = true;
  error: string = '';
  successMessage: string = '';
  
  showFailureModal: boolean = false;
  selectedOrder: Order | null = null;
  failureReason: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDeliveries();
  }

  loadDeliveries() {
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
          o => o.assignedDriverId === currentDriverId
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load delivery data';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading delivery data:', error);
      }
    });
  }

  markAsCompleted(order: Order) {
    const updatedOrder = { ...order, status: 'completed' };
    
    this.apiService.updateOrder(order.id, updatedOrder).subscribe({
      next: () => {
        this.updateInventory(order);
        this.loadDeliveries();
        this.successMessage = `Delivery ${order.id} marked as completed successfully!`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to mark delivery as completed';
        console.error('Error updating order:', error);
      }
    });
  }

  markAsFailed(order: Order) {
    this.selectedOrder = order;
    this.showFailureModal = true;
    this.failureReason = '';
  }

  confirmFailure() {
    if (this.failureReason.trim()) {
      this.closeFailureModal();
    }
  }

  closeFailureModal() {
    this.showFailureModal = false;
    this.selectedOrder = null;
    this.failureReason = '';
  }

  updateInventory(order: Order) {
    const destination = this.destinations.find(h => h.id === order.destinationId);
    if (destination) {
      const updatedInventory = { ...destination.inventory };
      
      if (order.product === 'diesel') {
        updatedInventory.diesel += order.quantity;
      } else if (order.product === 'petrol') {
        updatedInventory.petrol += order.quantity;
      }

      const updatedDestination = { ...destination, inventory: updatedInventory };
      
      this.apiService.updateHub(destination.id, updatedDestination).subscribe({
        next: () => {
          console.log('Inventory updated successfully');
        },
        error: (error) => {
          console.error('Failed to update inventory:', error);
        }
      });
    }
  }

  endShift() {
    if (confirm('Are you sure you want to end your shift?')) {
      alert('Shift ended successfully!');
    }
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
      case 'failed': return 'status-failed';
      default: return 'status-default';
    }
  }

  canMarkCompleted(order: Order): boolean {
    return order.status === 'assigned' || order.status === 'in-transit';
  }

  canMarkFailed(order: Order): boolean {
    return order.status === 'assigned' || order.status === 'in-transit';
  }
}
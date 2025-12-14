import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Order } from '../../../models';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  filterStatus: string = '';
  filterProduct: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load orders';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading orders:', error);
      }
    });
  }


  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = order.product.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           order.destinationId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;
      const matchesProduct = !this.filterProduct || order.product === this.filterProduct;
      return matchesSearch && matchesStatus && matchesProduct;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onProductFilterChange() {
    this.applyFilters();
  }

  getDestinationName(destinationId: string): string {
    return destinationId || 'Unassigned';
  }

  getDriverName(driverId: string | null): string {
    return driverId || 'Unassigned';
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'pending',
      'assigned': 'assigned',
      'in-transit': 'in-transit',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    return statusColors[status] || 'pending';
  }

  deleteOrder(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.apiService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          this.error = 'Failed to delete order';
          console.error('Error deleting order:', error);
        }
      });
    }
  }
}
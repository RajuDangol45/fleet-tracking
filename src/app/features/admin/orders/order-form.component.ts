import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Order, Hub, Driver } from '../../../models';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  isEditMode: boolean = false;
  orderId?: string;
  hubs: Hub[] = [];
  drivers: Driver[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.orderForm = this.createForm();
  }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.orderId;

    this.loadInitialData();
  }

  createForm(): FormGroup {
    return this.fb.group({
      destinationId: ['', Validators.required],
      product: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      deliveryDate: ['', Validators.required],
      assignedDriverId: [''],
      status: ['pending', Validators.required]
    });
  }

  loadInitialData() {
    this.loading = true;
    this.error = '';

    const requests = {
      hubs: this.apiService.getHubs(),
      drivers: this.apiService.getDrivers(),
      ...(this.isEditMode && this.orderId && { order: this.apiService.getOrder(this.orderId) })
    };

    forkJoin(requests).subscribe({
      next: (data: any) => {
        this.hubs = data.hubs;
        this.drivers = data.drivers;
        
        if (data.order) {
          this.orderForm.patchValue({
            destinationId: data.order.destinationId,
            product: data.order.product,
            quantity: data.order.quantity,
            deliveryDate: data.order.deliveryDate,
            assignedDriverId: data.order.assignedDriverId || '',
            status: data.order.status
          });
        }
        
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

  onSubmit() {
    if (this.orderForm.valid) {
      this.loading = true;
      this.error = '';

      const orderData: Partial<Order> = {
        destinationId: this.orderForm.value.destinationId,
        product: this.orderForm.value.product,
        quantity: Number(this.orderForm.value.quantity),
        deliveryDate: this.orderForm.value.deliveryDate,
        assignedDriverId: this.orderForm.value.assignedDriverId || null,
        status: this.orderForm.value.status
      };

      const request = this.isEditMode && this.orderId
        ? this.apiService.updateOrder(this.orderId, orderData)
        : this.apiService.createOrder(orderData as Omit<Order, 'id'>);

      request.subscribe({
        next: () => {
          this.router.navigate(['/admin/orders']);
        },
        error: (error) => {
          this.error = this.isEditMode ? 'Failed to update order' : 'Failed to create order';
          this.loading = false;
          this.cdr.detectChanges();
          console.error('Error saving order:', error);
        }
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  markAllFieldsAsTouched() {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

  onCancel() {
    this.router.navigate(['/admin/orders']);
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.touched && field.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'destinationId': 'Destination',
      'product': 'Product',
      'quantity': 'Quantity',
      'deliveryDate': 'Delivery Date',
      'assignedDriverId': 'Assigned Driver',
      'status': 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.touched && field.invalid);
  }
}
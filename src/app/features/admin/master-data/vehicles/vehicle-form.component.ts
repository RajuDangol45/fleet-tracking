import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Vehicle } from '../../../../models';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  isEditMode: boolean = false;
  vehicleId?: string;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.vehicleForm = this.createForm();
  }

  ngOnInit() {
    this.vehicleId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.vehicleId;

    if (this.isEditMode && this.vehicleId) {
      this.loadVehicle(this.vehicleId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      registration: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  loadVehicle(id: string) {
    this.loading = true;
    this.error = '';

    this.apiService.getVehicle(id).subscribe({
      next: (vehicle) => {
        this.vehicleForm.patchValue({
          registration: vehicle.registration,
          type: vehicle.type,
          capacity: vehicle.capacity
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load vehicle';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading vehicle:', error);
      }
    });
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      this.loading = true;
      this.error = '';

      const vehicleData: Partial<Vehicle> = {
        registration: this.vehicleForm.value.registration,
        type: this.vehicleForm.value.type,
        capacity: Number(this.vehicleForm.value.capacity)
      };

      const request = this.isEditMode && this.vehicleId
        ? this.apiService.updateVehicle(this.vehicleId, vehicleData)
        : this.apiService.createVehicle(vehicleData as Omit<Vehicle, 'id'>);

      request.subscribe({
        next: () => {
          this.router.navigate(['/admin/master-data/vehicles']);
        },
        error: (error) => {
          this.error = this.isEditMode ? 'Failed to update vehicle' : 'Failed to create vehicle';
          this.loading = false;
          this.cdr.detectChanges();
          console.error('Error saving vehicle:', error);
        }
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  markAllFieldsAsTouched() {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      this.vehicleForm.get(key)?.markAsTouched();
    });
  }

  onCancel() {
    this.router.navigate(['/admin/master-data/vehicles']);
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field?.touched && field.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'registration': 'Registration',
      'type': 'Type',
      'capacity': 'Capacity'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field?.touched && field.invalid);
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Driver } from '../../../../models';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss']
})
export class DriverFormComponent implements OnInit {
  driverForm: FormGroup;
  isEditMode: boolean = false;
  driverId: string | null = null;
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.driverForm = this.createForm();
  }

  ngOnInit() {
    this.driverId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.driverId;

    if (this.isEditMode) {
      this.loadDriver();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      license: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]]
    });
  }

  loadDriver() {
    if (!this.driverId) return;

    this.loading = true;
    this.apiService.getDriver(this.driverId).subscribe({
      next: (driver) => {
        this.driverForm.patchValue({
          name: driver.name,
          license: driver.license,
          phone: driver.phone
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load driver details';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading driver:', error);
      }
    });
  }

  onSubmit() {
    if (this.driverForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const driverData = this.driverForm.value;

    const operation = this.isEditMode
      ? this.apiService.updateDriver(this.driverId!, driverData)
      : this.apiService.createDriver(driverData as Omit<Driver, 'id'>);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.cdr.detectChanges();
        this.router.navigate(['/admin/master-data/drivers']);
      },
      error: (error) => {
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} driver`;
        this.saving = false;
        this.cdr.detectChanges();
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} driver:`, error);
      }
    });
  }

  markFormGroupTouched() {
    Object.keys(this.driverForm.controls).forEach(key => {
      const control = this.driverForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.driverForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return `${fieldName} format is invalid`;
      }
    }
    return '';
  }

  cancel() {
    this.router.navigate(['/admin/master-data/drivers']);
  }
}
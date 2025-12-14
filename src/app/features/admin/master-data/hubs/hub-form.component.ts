import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Hub } from '../../../../models';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-hub-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hub-form.component.html',
  styleUrls: ['./hub-form.component.scss']
})
export class HubFormComponent implements OnInit {
  hubForm: FormGroup;
  isEditMode: boolean = false;
  hubId: string | null = null;
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
    this.hubForm = this.createForm();
  }

  ngOnInit() {
    this.hubId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.hubId;

    if (this.isEditMode) {
      this.loadHub();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['hub', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      lat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      lng: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      diesel: [15000, [Validators.required, Validators.min(0)]],
      petrol: [12000, [Validators.required, Validators.min(0)]]
    });
  }

  loadHub() {
    if (!this.hubId) return;

    this.loading = true;
    this.apiService.getHub(this.hubId).subscribe({
      next: (hub) => {
        this.hubForm.patchValue({
          name: hub.name,
          type: hub.type,
          address: hub.address,
          lat: hub.coordinates.lat,
          lng: hub.coordinates.lng,
          diesel: hub.inventory.diesel,
          petrol: hub.inventory.petrol
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load hub details';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading hub:', error);
      }
    });
  }

  onSubmit() {
    if (this.hubForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const formValue = this.hubForm.value;
    const hubData = {
      name: formValue.name,
      type: formValue.type,
      address: formValue.address,
      coordinates: {
        lat: Number(formValue.lat),
        lng: Number(formValue.lng)
      },
      inventory: {
        diesel: Number(formValue.diesel),
        petrol: Number(formValue.petrol)
      }
    };

    const operation = this.isEditMode
      ? this.apiService.updateHub(this.hubId!, hubData)
      : this.apiService.createHub(hubData as Omit<Hub, 'id'>);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.cdr.detectChanges();
        this.router.navigate(['/admin/master-data']);
      },
      error: (error) => {
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} hub`;
        this.saving = false;
        this.cdr.detectChanges();
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} hub:`, error);
      }
    });
  }

  markFormGroupTouched() {
    Object.keys(this.hubForm.controls).forEach(key => {
      const control = this.hubForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.hubForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${fieldName} must be at most ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  cancel() {
    this.router.navigate(['/admin/master-data']);
  }
}
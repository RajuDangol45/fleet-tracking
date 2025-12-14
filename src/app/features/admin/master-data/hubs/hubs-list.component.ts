import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Hub } from '../../../../models';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-hubs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hubs-list.component.html',
  styleUrls: ['./hubs-list.component.scss']
})
export class HubsListComponent implements OnInit {
  hubs: Hub[] = [];
  filteredHubs: Hub[] = [];
  searchTerm: string = '';
  filterType: string = '';
  loading: boolean = true;
  error: string = '';
  threshold: number = 5000;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadHubs();
  }

  loadHubs() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getHubs().subscribe({
      next: (hubs) => {
        this.hubs = hubs;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load hubs';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading hubs:', error);
      }
    });
  }

  applyFilters() {
    this.filteredHubs = this.hubs.filter(hub => {
      const matchesSearch = hub.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           hub.address.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.filterType || hub.type === this.filterType;
      return matchesSearch && matchesType;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onTypeFilterChange() {
    this.applyFilters();
  }

  deleteHub(id: string) {
    if (confirm('Are you sure you want to delete this hub?')) {
      this.apiService.deleteHub(id).subscribe({
        next: () => {
          this.loadHubs();
        },
        error: (error) => {
          this.error = 'Failed to delete hub';
          console.error('Error deleting hub:', error);
        }
      });
    }
  }
}
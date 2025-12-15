import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { HubsListComponent } from './hubs-list.component';
import { ApiService } from '../../../../services/api.service';
import { Hub } from '../../../../models';

describe('HubsListComponent', () => {
  let component: HubsListComponent;
  let fixture: ComponentFixture<HubsListComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  const mockHubs: Hub[] = [
    {
      id: '1',
      name: 'Central Hub',
      type: 'hub',
      address: '123 Main St, City',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      inventory: { diesel: 5000, petrol: 3000 }
    },
    {
      id: '2',
      name: 'Terminal A',
      type: 'terminal',
      address: '456 Oak Ave, Town',
      coordinates: { lat: 41.8781, lng: -87.6298 },
      inventory: { diesel: 2000, petrol: 1500 }
    },
    {
      id: '3',
      name: 'South Hub',
      type: 'hub',
      address: '789 Pine Rd, Village',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      inventory: { diesel: 3500, petrol: 2500 }
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getHubs', 'deleteHub']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [HubsListComponent],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HubsListComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize with default values', () => {
      expect(component.hubs).toEqual([]);
      expect(component.filteredHubs).toEqual([]);
      expect(component.searchTerm).toBe('');
      expect(component.filterType).toBe('');
      expect(component.loading).toBe(true);
      expect(component.error).toBe('');
      expect(component.threshold).toBe(5000);
    });
  });

  describe('loadHubs', () => {
    it('should load hubs successfully', () => {
      apiService.getHubs.and.returnValue(of(mockHubs));

      component.loadHubs();

      expect(component.loading).toBe(false);
      expect(component.hubs).toEqual(mockHubs);
      expect(component.filteredHubs).toEqual(mockHubs);
      expect(component.error).toBe('');
    });

    it('should handle error when loading hubs fails', () => {
      const errorResponse = new Error('Network error');
      apiService.getHubs.and.returnValue(throwError(() => errorResponse));

      component.loadHubs();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Failed to load hubs');
      expect(component.hubs).toEqual([]);
    });

    it('should set loading to true when starting to load', () => {
      apiService.getHubs.and.returnValue(of(mockHubs));
      component.loading = false;

      component.loadHubs();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.hubs = mockHubs;
    });

    it('should show all hubs when no filters are applied', () => {
      component.searchTerm = '';
      component.filterType = '';

      component.applyFilters();

      expect(component.filteredHubs).toEqual(mockHubs);
    });

    it('should filter hubs by search term in name', () => {
      component.searchTerm = 'Central';
      component.filterType = '';

      component.applyFilters();

      expect(component.filteredHubs).toEqual([mockHubs[0]]);
    });

    it('should filter hubs by search term in address', () => {
      component.searchTerm = 'Oak';
      component.filterType = '';

      component.applyFilters();

      expect(component.filteredHubs).toEqual([mockHubs[1]]);
    });

    it('should filter hubs by type', () => {
      component.searchTerm = '';
      component.filterType = 'terminal';

      component.applyFilters();

      expect(component.filteredHubs).toEqual([mockHubs[1]]);
    });

    it('should apply both search and type filters', () => {
      component.searchTerm = 'Hub';
      component.filterType = 'hub';

      component.applyFilters();

      expect(component.filteredHubs).toEqual([mockHubs[0], mockHubs[2]]);
    });

    it('should be case insensitive for search', () => {
      component.searchTerm = 'CENTRAL';
      component.filterType = '';

      component.applyFilters();

      expect(component.filteredHubs).toEqual([mockHubs[0]]);
    });

    it('should return empty array when no matches found', () => {
      component.searchTerm = 'NonExistent';
      component.filterType = '';

      component.applyFilters();

      expect(component.filteredHubs).toEqual([]);
    });
  });

  describe('onSearchChange', () => {
    it('should call applyFilters when search changes', () => {
      spyOn(component, 'applyFilters');
      
      component.onSearchChange();
      
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('onTypeFilterChange', () => {
    it('should call applyFilters when type filter changes', () => {
      spyOn(component, 'applyFilters');
      
      component.onTypeFilterChange();
      
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('deleteHub', () => {
    beforeEach(() => {
      spyOn(window, 'confirm');
      spyOn(component, 'loadHubs');
    });

    it('should delete hub when user confirms', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      apiService.deleteHub.and.returnValue(of(undefined));

      component.deleteHub('1');

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this hub?');
      expect(apiService.deleteHub).toHaveBeenCalledWith('1');
      expect(component.loadHubs).toHaveBeenCalled();
    });

    it('should not delete hub when user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.deleteHub('1');

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this hub?');
      expect(apiService.deleteHub).not.toHaveBeenCalled();
      expect(component.loadHubs).not.toHaveBeenCalled();
    });

    it('should handle error when delete fails', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      const errorResponse = new Error('Delete failed');
      apiService.deleteHub.and.returnValue(throwError(() => errorResponse));

      component.deleteHub('1');

      expect(apiService.deleteHub).toHaveBeenCalledWith('1');
      expect(component.error).toBe('Failed to delete hub');
      expect(component.loadHubs).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should call loadHubs on initialization', () => {
      spyOn(component, 'loadHubs');
      
      component.ngOnInit();
      
      expect(component.loadHubs).toHaveBeenCalled();
    });
  });
});
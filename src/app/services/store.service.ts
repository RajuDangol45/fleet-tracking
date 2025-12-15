import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Hub, Driver, Vehicle, Order } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private hubsSubject = new BehaviorSubject<Hub[]>([]);
  private driversSubject = new BehaviorSubject<Driver[]>([]);
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public hubs$ = this.hubsSubject.asObservable();
  public drivers$ = this.driversSubject.asObservable();
  public vehicles$ = this.vehiclesSubject.asObservable();
  public orders$ = this.ordersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadAllData(): Observable<any> {
    this.loadingSubject.next(true);
    
    return forkJoin({
      hubs: this.apiService.getHubs(),
      drivers: this.apiService.getDrivers(),
      vehicles: this.apiService.getVehicles(),
      orders: this.apiService.getOrders()
    }).pipe(
      tap(data => {
        this.hubsSubject.next(data.hubs);
        this.driversSubject.next(data.drivers);
        this.vehiclesSubject.next(data.vehicles);
        this.ordersSubject.next(data.orders);
        this.loadingSubject.next(false);
      })
    );
  }

  syncData(): Observable<any> {
    return this.loadAllData();
  }

  getHubs(): Hub[] {
    return this.hubsSubject.value;
  }

  getDrivers(): Driver[] {
    return this.driversSubject.value;
  }

  getVehicles(): Vehicle[] {
    return this.vehiclesSubject.value;
  }

  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  addHub(hub: Hub): void {
    const currentHubs = this.hubsSubject.value;
    this.hubsSubject.next([...currentHubs, hub]);
  }

  updateHub(updatedHub: Hub): void {
    const currentHubs = this.hubsSubject.value;
    const index = currentHubs.findIndex(h => h.id === updatedHub.id);
    if (index !== -1) {
      const newHubs = [...currentHubs];
      newHubs[index] = updatedHub;
      this.hubsSubject.next(newHubs);
    }
  }

  deleteHub(hubId: string): void {
    const currentHubs = this.hubsSubject.value;
    this.hubsSubject.next(currentHubs.filter(h => h.id !== hubId));
  }

  addDriver(driver: Driver): void {
    const currentDrivers = this.driversSubject.value;
    this.driversSubject.next([...currentDrivers, driver]);
  }

  updateDriver(updatedDriver: Driver): void {
    const currentDrivers = this.driversSubject.value;
    const index = currentDrivers.findIndex(d => d.id === updatedDriver.id);
    if (index !== -1) {
      const newDrivers = [...currentDrivers];
      newDrivers[index] = updatedDriver;
      this.driversSubject.next(newDrivers);
    }
  }

  deleteDriver(driverId: string): void {
    const currentDrivers = this.driversSubject.value;
    this.driversSubject.next(currentDrivers.filter(d => d.id !== driverId));
  }

  addVehicle(vehicle: Vehicle): void {
    const currentVehicles = this.vehiclesSubject.value;
    this.vehiclesSubject.next([...currentVehicles, vehicle]);
  }

  updateVehicle(updatedVehicle: Vehicle): void {
    const currentVehicles = this.vehiclesSubject.value;
    const index = currentVehicles.findIndex(v => v.id === updatedVehicle.id);
    if (index !== -1) {
      const newVehicles = [...currentVehicles];
      newVehicles[index] = updatedVehicle;
      this.vehiclesSubject.next(newVehicles);
    }
  }

  deleteVehicle(vehicleId: string): void {
    const currentVehicles = this.vehiclesSubject.value;
    this.vehiclesSubject.next(currentVehicles.filter(v => v.id !== vehicleId));
  }

  addOrder(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    this.ordersSubject.next([...currentOrders, order]);
  }

  updateOrder(updatedOrder: Order): void {
    const currentOrders = this.ordersSubject.value;
    const index = currentOrders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      const newOrders = [...currentOrders];
      newOrders[index] = updatedOrder;
      this.ordersSubject.next(newOrders);
    }
  }

  deleteOrder(orderId: string): void {
    const currentOrders = this.ordersSubject.value;
    this.ordersSubject.next(currentOrders.filter(o => o.id !== orderId));
  }
}
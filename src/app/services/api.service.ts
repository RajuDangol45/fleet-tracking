import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hub, Driver, Vehicle, Order, VehicleAllocation } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getHubs(): Observable<Hub[]> {
    return this.http.get<Hub[]>(`${this.baseUrl}/hubs`);
  }

  getHub(id: string): Observable<Hub> {
    return this.http.get<Hub>(`${this.baseUrl}/hubs/${id}`);
  }

  createHub(hub: Omit<Hub, 'id'>): Observable<Hub> {
    return this.http.post<Hub>(`${this.baseUrl}/hubs`, hub);
  }

  updateHub(id: string, hub: Partial<Hub>): Observable<Hub> {
    return this.http.patch<Hub>(`${this.baseUrl}/hubs/${id}`, hub);
  }

  deleteHub(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/hubs/${id}`);
  }

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.baseUrl}/drivers`);
  }

  getDriver(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.baseUrl}/drivers/${id}`);
  }

  createDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    return this.http.post<Driver>(`${this.baseUrl}/drivers`, driver);
  }

  updateDriver(id: string, driver: Partial<Driver>): Observable<Driver> {
    return this.http.patch<Driver>(`${this.baseUrl}/drivers/${id}`, driver);
  }

  deleteDriver(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/drivers/${id}`);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles`);
  }

  getVehicle(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/vehicles/${id}`);
  }

  createVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.baseUrl}/vehicles/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }

  createOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, order);
  }

  updateOrder(id: string, order: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, order);
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orders/${id}`);
  }

  getVehicleAllocations(): Observable<VehicleAllocation[]> {
    return this.http.get<VehicleAllocation[]>(`${this.baseUrl}/vehicleAllocations`);
  }

  getVehicleAllocation(id: string): Observable<VehicleAllocation> {
    return this.http.get<VehicleAllocation>(`${this.baseUrl}/vehicleAllocations/${id}`);
  }

  createVehicleAllocation(allocation: Omit<VehicleAllocation, 'id'>): Observable<VehicleAllocation> {
    return this.http.post<VehicleAllocation>(`${this.baseUrl}/vehicleAllocations`, allocation);
  }

  updateVehicleAllocation(id: string, allocation: Partial<VehicleAllocation>): Observable<VehicleAllocation> {
    return this.http.patch<VehicleAllocation>(`${this.baseUrl}/vehicleAllocations/${id}`, allocation);
  }

  deleteVehicleAllocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vehicleAllocations/${id}`);
  }
}
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Inventory {
  diesel: number;
  petrol: number;
}

export interface Hub {
  id: string;
  name: string;
  type: 'hub' | 'terminal';
  address: string;
  coordinates: Coordinates;
  inventory: Inventory;
}
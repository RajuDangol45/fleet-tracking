export interface Order {
  id: string;
  destinationId: string;
  product: string;
  quantity: number;
  deliveryDate: string;
  assignedDriverId: string | null;
  status: string;
}
export interface IQuota {
  paymentId: string | null;
  drawnNumber: string;
  status: 'available' | 'sold' | 'pending';
  buyer: string | null;
}

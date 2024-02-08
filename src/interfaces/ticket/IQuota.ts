export interface IQuota {
  paymentId: string | null;
  drawnNumber: string;
  status: 'available' | 'sold';
  buyer: string | null;
}

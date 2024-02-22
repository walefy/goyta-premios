import { Types } from 'mongoose';

export interface IQuota {
  paymentId: string | null;
  drawnNumber: string;
  status: 'available' | 'sold' | 'pending';
  buyer: Types.ObjectId | null;
}

import { Schema, model } from 'mongoose';
import { ITicket } from '../../interfaces/ticket/ITicket';
import { IPrize } from '../../interfaces/ticket/IPrize';
import { IQuota } from '../../interfaces/ticket/IQuota';

const prizesSchema = new Schema<IPrize>({
  name: {
    type: String,
    required: true,
  },
  drawNumber: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [String],
  equivalentPrice: {
    type: Number,
    required: true,
  },
}, { versionKey: false });

const quotaSchema = new Schema<IQuota>({
  paymentId: String,
  drawnNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'available',
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  }
}, { versionKey: false });

export const ticketSchema = new Schema<ITicket>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: Date,
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  limitByUser: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'running',
  },
  quotas: [quotaSchema],
  prizes: [prizesSchema],
}, { versionKey: false });

export const Ticket = model<ITicket>('Ticket', ticketSchema);

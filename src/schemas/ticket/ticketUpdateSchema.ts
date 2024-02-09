import { z } from 'zod';

export const ticketUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0.01).optional(),
  limitByUser: z.number().min(1).optional(),
  endDate: z.date().nullable().optional(),
  status: z.enum(['running', 'closed']).optional(),
});

import { z } from 'zod';
import { creationPrizeSchema } from './creationPrizeSchema';

export const ticketCreationSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0.01),
  quantity: z.number().min(1),
  limitByUser: z.number().min(1),
  prizes: z.array(creationPrizeSchema),
});

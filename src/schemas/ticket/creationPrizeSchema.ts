import { z } from 'zod';

export const creationPrizeSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  equivalentPrice: z.number().min(0.01),
  images: z.array(z.string()),
});

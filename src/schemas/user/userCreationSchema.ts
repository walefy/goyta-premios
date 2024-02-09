import { z } from 'zod';

export const userCreationSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(11).max(11),
  image: z.string().optional(),
});

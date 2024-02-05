import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().min(11).max(11).optional(),
  image: z.string().optional(),
});

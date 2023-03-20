import { z } from "zod";

export const PremiumSchema = z.object({
  user_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  expired_at: z.string().datetime().optional(),
});

export type PremiumSchema = z.infer<typeof PremiumSchema>;

import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  user_id: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;

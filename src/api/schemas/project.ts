import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  user_id: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ProjectCreateEditSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  user_id: z.string(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type ProjectCreateEditSchemaType = z.infer<
  typeof ProjectCreateEditSchema
>;

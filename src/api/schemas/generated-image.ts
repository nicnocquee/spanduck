import { z } from "zod";

export const TwitterImageMetadataSchema = z.object({
  username: z.string(),
  display_name: z.string(),
  images: z.string(),
  content: z.string(),
  avatar: z.string(),
  tweet_id: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type TwitterImageMetadataSchemaType = z.infer<
  typeof TwitterImageMetadataSchema
>;

export const WebImageMetadataSchema = z.object({
  title: z.string(),
  image: z.string(),
  type: z.string(),
  description: z.string(),
  site_name: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type WebImageMetadataSchemaType = z.infer<typeof WebImageMetadataSchema>;

export const CreateGeneratedImageSchema = z.object({
  url: z.string(),
  type: z.enum(["twitter", "url"]),
  user_id: z.string(),
  project_id: z.number(),
  template_id: z.number(),
});

export const GeneratedImageSchema = z.object({
  name: z.string(),
  type: z.enum(["twitter", "url"]),
  url: z.string(),
  image: z.string(),
  image_metadata: z.union([TwitterImageMetadataSchema, WebImageMetadataSchema]),
  user_id: z.string(),
  project_id: z.number(),
  template_id: z.number(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type CreateGeneratedImageSchemaType = z.infer<
  typeof CreateGeneratedImageSchema
>;
export type GeneratedImageSchemaType = z.infer<typeof GeneratedImageSchema>;

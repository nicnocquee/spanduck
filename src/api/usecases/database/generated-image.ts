import { IQuery } from "@/api/interfaces/query";
import {
  GeneratedImageCreateSchemaType,
  GeneratedImageSchemaType,
} from "@/api/schemas/generated-image";
import getWithQuery from "@/api/utils/get-with-query";
import { supabase } from "@/api/utils/supabase";

export async function getGeneratedImages(query?: IQuery) {
  let base = supabase.from("generated_images").select(
    `
    *, 
    project:projects (*)
  `,
    {
      count: "exact",
    }
  );
  const response = await getWithQuery(base, query);

  return response;
}

export async function getGeneratedImageByID(id: number) {
  return await supabase
    .from("generated_images")
    .select("*", {
      count: "exact",
    })
    .eq("id", id);
}

export async function createGeneratedImage(
  body: GeneratedImageCreateSchemaType | GeneratedImageSchemaType
) {
  return supabase
    .from("generated_images")
    .insert({
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .select();
}

export async function deleteGeneratedImageByID(id: number) {
  return supabase.from("generated_images").delete().eq("id", id);
}

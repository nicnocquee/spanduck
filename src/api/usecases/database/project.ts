import { IQuery } from "@/api/interfaces/query";
import { ProjectCreateEditSchemaType } from "@/api/schemas/project";
import getWithQuery from "@/api/utils/get-with-query";
import { supabase } from "@/api/utils/supabase";

export async function getProjects(query?: IQuery) {
  let base = supabase.from("projects").select("*", {
    count: "exact",
  });
  const response = await getWithQuery(base, query);

  return response;
}

export async function getProjectByID(id: number) {
  return await supabase
    .from("projects")
    .select("*", {
      count: "exact",
    })
    .eq("id", id);
}

export async function createProject(body: ProjectCreateEditSchemaType) {
  return supabase
    .from("projects")
    .insert({
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .select();
}

export async function editProject(
  id: number,
  body: ProjectCreateEditSchemaType
) {
  return supabase
    .from("projects")
    .update({
      ...body,
      updated_at: new Date(),
    })
    .eq("id", id)
    .select();
}

export async function deleteProject(id: number) {
  return supabase.from("projects").delete().eq("id", id);
}

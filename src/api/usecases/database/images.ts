import { IImageData } from "@/api/interfaces/image";
import { supabase } from "@/utils/supabase";

export async function getImageData() {
  return await supabase.from("images").select("*");
}

export async function getImageDataByURL(url: string) {
  return await supabase.from("images").select("*").eq("url", url).limit(1);
}

export async function createImageData(body: IImageData) {
  return await supabase.from("images").insert(body);
}

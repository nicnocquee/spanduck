import { supabase } from "@/utils/supabase";
import { FileOptions } from "@supabase/storage-js";

type TFile =
  | string
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | Buffer
  | File
  | FormData
  | NodeJS.ReadableStream
  | URLSearchParams;

export async function getTwitterStorage() {
  return supabase.storage.getBucket("twitter");
}

export async function createTwitterStorage() {
  return supabase.storage.createBucket("twitter");
}

export async function getTwitterStorageByObjectName(path: string) {
  return supabase.storage.from("twitter").createSignedUrl(path, 1, {
    download: false,
  });
}

export async function uploadToTwitterStorage(
  targetPath: string,
  file: TFile,
  fileOptions?: FileOptions
) {
  return supabase.storage.from("twitter").upload(targetPath, file, fileOptions);
}

export async function getTwitterObjectURL(path: string) {
  const { data } = supabase.storage.from("twitter").getPublicUrl(path);
  return data.publicUrl;
}

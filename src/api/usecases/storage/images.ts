import { supabase } from "@/api/utils/supabase";
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

export async function getImageStorage() {
  return supabase.storage.getBucket("images");
}

export async function createImageStorage() {
  return supabase.storage.createBucket("images");
}

export async function getImageStorageByObjectName(path: string) {
  return supabase.storage.from("images").createSignedUrl(path, 1, {
    download: false,
  });
}

export async function uploadToImageStorage(
  targetPath: string,
  file: TFile,
  fileOptions?: FileOptions
) {
  return supabase.storage.from("images").upload(targetPath, file, fileOptions);
}

export async function getImageObjectURL(path: string) {
  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import parser from "html-metadata-parser";
import { WebImageMetadataSchemaType } from "../schemas/generated-image";
import { ImageTemplateEngine } from "./image-template-engine";
import { nanoid } from "nanoid";
import {
  createImageStorage,
  getImageObjectURL,
  getImageStorage,
  uploadToImageStorage,
} from "../usecases/storage/images";

interface TPayload {
  url: string;
  template_id: number;
  project_id: number;
  user_id: string;
}

export default async function generateImageFromURL({
  url,
  template_id,
  user_id,
  project_id,
}: TPayload) {
  // Generate a nanoid
  const nanoID = nanoid(16);

  // Check if source is available
  if (!url) {
    throw new Error("Source is required!");
  }

  // Get the metadata
  const result = await parser(url);

  console.log(result);

  // If exists, return from Database
  // Else, fetch from the URL
  const image_metadata: WebImageMetadataSchemaType = {
    title: result.og.title || result.meta.title || "",
    description: result.og.description || result.meta.description || "",
    image: result.og.image || result.images?.[0] || "",
    site_name: result.og.site_name || result.meta.site_name || "",
    type: result.og.type || result.meta.type || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Check if the template exists
  if (!fs.existsSync(path.resolve(`templates/${template_id}.html`))) {
    throw new Error("Template not found!");
  }

  // Generate image
  let outputPath: string = "";
  let imageURL: string = "";
  const fileName = `${user_id}_${project_id}_${nanoID}.png`;
  const ITE = new ImageTemplateEngine({
    url,
    unique_id: nanoID,
    ...image_metadata,
  });
  outputPath = await ITE.generate(template_id || 1, fileName);

  // Check if bucket existed
  const isBucketExists = await getImageStorage();
  if (!isBucketExists) {
    await createImageStorage();
  }

  // Read file as buffer and upload the file to bucket
  const file = await fsPromises.readFile(outputPath);
  const { error } = await uploadToImageStorage(fileName, file, {
    upsert: true,
  });
  if (error) {
    throw new Error(error.message);
  }

  // Get download URL for image
  imageURL = await getImageObjectURL(fileName);

  return {
    fileName,
    image: imageURL,
    image_metadata,
  };
}

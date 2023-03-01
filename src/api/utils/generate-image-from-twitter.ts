import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { TwitterImageMetadataSchemaType } from "../schemas/generated-image";
import { ImageTemplateEngine } from "./image-template-engine";
import { nanoid } from "nanoid";
import {
  createImageStorage,
  getImageObjectURL,
  getImageStorage,
  uploadToImageStorage,
} from "../usecases/storage/images";
import { supabase } from "@/utils/supabase";

interface TPayload {
  url: string;
  template_id: number;
  project_id: number;
  user_id: string;
}

export default async function generateImageFromTwitter({
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

  // Validate the URL
  const urlObject = new URL(url);
  const { host, pathname } = urlObject;
  if (host !== "twitter.com") {
    throw new Error("Not a valid Twitter URL");
  }

  // Get the metadata
  // Get the tweet metadata
  let image_metadata: TwitterImageMetadataSchemaType;
  const tweet_id = pathname.split("/").pop() as string;
  const { data: functionData, error: functionError } =
    await supabase.functions.invoke("twitter", {
      body: {
        twitter_url: url,
      },
    });
  if (functionError) {
    throw new Error(functionError.message);
  }
  image_metadata = functionData;

  // Generate image
  let outputPath: string = "";
  let imageURL: string = "";
  const fileName = `${user_id}_${project_id}_${nanoID}.png`;
  if (!fs.existsSync(path.resolve(`templates/${template_id}.html`))) {
    throw new Error("Template not found!");
  }

  const ITE = new ImageTemplateEngine({
    url,
    unique_id: nanoID,
    ...image_metadata,
    tweet_id,
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

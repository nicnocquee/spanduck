import fs from "fs";
import path from "path";
import { TwitterImageMetadataSchemaType } from "../schemas/generated-image";
import { ImageTemplateEngine } from "./image-template-engine";
import { nanoid } from "nanoid";
import { getImageObjectURL } from "../usecases/storage/images";
import { supabase } from "@/api/utils/supabase";

interface TPayload {
  url: string;
  template_id: number;
  project_id: number;
  user_id: string;
  is_premium: boolean;
}

export default async function generateImageFromTwitter({
  url,
  template_id,
  user_id,
  project_id,
  is_premium,
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
  let imageURL: string = "";
  const fileName = `${nanoID}_${project_id}_${user_id}.png`;
  if (!fs.existsSync(path.resolve(`templates/${template_id}.html`))) {
    throw new Error("Template not found!");
  }

  const ITE = new ImageTemplateEngine(
    {
      url,
      unique_id: nanoID,
      ...image_metadata,
      tweet_id,
      content: image_metadata.content.trimStart(),
    },
    is_premium
  );
  await ITE.generate(template_id || 1, fileName);

  // Get download URL for image
  imageURL = await getImageObjectURL(fileName);

  return {
    fileName,
    image: imageURL,
    image_metadata,
  };
}

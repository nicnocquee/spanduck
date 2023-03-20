import { getImageObjectURL } from "@/api/usecases/storage/images";
import { ImageTemplateEngine } from "@/api/utils/image-template-engine";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { metadata, templateID, fileName, is_premium } = request.body;
  const ITE = new ImageTemplateEngine(metadata, is_premium);
  await ITE.generate(parseInt(templateID as string, 10) || 1, fileName);

  // Get download URL for image
  const imageURL = await getImageObjectURL(fileName);

  return response.status(200).json({
    message: "Successfully created an image",
    data: imageURL,
  });
}

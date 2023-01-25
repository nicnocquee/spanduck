import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import * as fsPromises from "fs/promises";
import fs from "node:fs";
import path from "node:path";
import z from "zod";
import handleResponse from "@/utils/handle-response";
import { ImageTemplateEngine } from "@/utils/image-template-engine";
import {
  createTwitterStorage,
  getTwitterObjectURL,
  getTwitterStorage,
  uploadToTwitterStorage,
} from "@/usecases/storage/twitter";
import { SupabaseFunctionsClient } from "@/config/axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method?.toLowerCase()) {
    case "post":
      await generate(req, res);
      break;
    default:
      return handleResponse(res, {
        status: StatusCodes.METHOD_NOT_ALLOWED,
        body: {
          message: "Method is not allowed",
          data: null,
        },
      });
  }
}

/**
 * generate() will generate image based on the Twitter URL and Template ID
 * provided in the request body
 * @param req Next API Request
 * @param res Next API Response
 * @returns the public URL of the image uploaded to the Supabase
 */
async function generate(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate incoming data
    const { body } = req;
    const schema = z.object({
      url: z.string().url(),
      templateID: z.number(),
    });
    const validated = await schema.parseAsync(body);

    // Get the tweet metadata
    const response = await SupabaseFunctionsClient.post("/twitter", {
      twitter_url: validated.url,
    });
    if (response.status !== 200) {
      return handleResponse(res, {
        status: response.status,
        body: response.data,
      });
    }
    const metadata = response.data;

    // Check if the template exists
    const { templateID } = validated;
    if (!fs.existsSync(path.resolve(`templates/${templateID}.html`))) {
      return handleResponse(res, {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        body: {
          message: "Template not found!",
          data: null,
        },
      });
    }

    // Generate image
    const ITE = new ImageTemplateEngine(metadata);
    const { outputPath, fileName } = await ITE.generate(templateID);

    // Check if bucket existed
    const isBucketExists = await getTwitterStorage();
    if (!isBucketExists) {
      await createTwitterStorage();
    }

    // Read file as buffer and upload the file to bucket
    const file = await fsPromises.readFile(outputPath);
    const { data, error } = await uploadToTwitterStorage(fileName, file, {
      upsert: true,
    });
    if (error) {
      throw new Error(error.message);
    }

    // Get download URL for image
    const url = await getTwitterObjectURL(data.path);

    return handleResponse(res, {
      status: StatusCodes.OK,
      body: {
        message: "Successfully created an image",
        data: url,
      },
    });
  } catch (e: any) {
    return handleResponse(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      body: {
        message: e.message,
        data: null,
      },
    });
  }
}

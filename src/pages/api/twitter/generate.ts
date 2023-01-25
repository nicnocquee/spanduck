import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import * as fsPromises from "fs/promises";
import fs from "node:fs";
import path from "node:path";
import z from "zod";
import handleResponse from "@/api/utils/handle-response";
import { ImageTemplateEngine } from "@/api/utils/image-template-engine";
import {
  createTwitterStorage,
  getTwitterObjectURL,
  getTwitterStorage,
  getTwitterStorageByObjectName,
  uploadToTwitterStorage,
} from "@/api/usecases/storage/twitter";
import {
  createTwitterData,
  getTwitterDataByTweetID,
} from "@/api/usecases/database/twitter";
import { ITwitterData } from "@/api/interfaces/twitter";
import { supabase } from "@/utils/supabase";

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

    // Validate the URL
    const urlObject = new URL(validated.url);
    const { host, pathname } = urlObject;
    if (host !== "twitter.com") {
      return handleResponse(res, {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        body: {
          message: "Not a valid Twitter URL",
          data: null,
        },
      });
    }

    // Check if tweet metadata already exists
    let metadata: ITwitterData;
    const tweetID = pathname.split("/").pop() as string;
    const { data: found, error: findError } = await getTwitterDataByTweetID(
      tweetID
    );

    // If exists, return from Database
    // Else, fetch from Twitter API
    if (found && found.length === 1 && !findError) {
      console.debug("Twitter Metadata found. Using previous data...");
      const [foundMetadata] = found;
      metadata = foundMetadata;
    } else {
      console.debug("Twitter Metadata not found. Generating...");
      // Get the tweet metadata
      const { data: functionData, error: functionError } =
        await supabase.functions.invoke("twitter", {
          body: {
            twitter_url: validated.url,
          },
        });

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Create a new entry in the database
      const { error: createError } = await createTwitterData({
        ...functionData,
        tweet_id: tweetID,
      });

      if (createError) {
        throw new Error(createError.message);
      }

      metadata = functionData;
    }

    // Check if image is already generated
    let url: string;
    const { templateID } = validated;
    const fileName = `${tweetID}_${templateID}.png`;
    const { data: imageData, error: imageError } =
      await getTwitterStorageByObjectName(fileName);

    if (imageData && !imageError) {
      console.debug("Generated image found. Using previous data...");
      url = await getTwitterObjectURL(fileName);
    } else {
      console.debug("Generated image not found. Generating...");
      // Check if the template exists
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
      const outputPath = await ITE.generate(templateID, fileName);

      // Check if bucket existed
      const isBucketExists = await getTwitterStorage();
      if (!isBucketExists) {
        await createTwitterStorage();
      }

      // Read file as buffer and upload the file to bucket
      const file = await fsPromises.readFile(outputPath);
      const { error } = await uploadToTwitterStorage(fileName, file, {
        upsert: true,
      });
      if (error) {
        throw new Error(error.message);
      }

      // Get download URL for image
      url = await getTwitterObjectURL(fileName);
    }

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

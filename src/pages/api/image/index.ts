import fs from "fs";
import fsPromises from "fs/promises";
import path from "node:path";
import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { parser } from "html-metadata-parser";
import handleResponse, {
  handleFileResponse,
} from "@/api/utils/handle-response";
import {
  createImageData,
  getImageDataByURL,
} from "@/api/usecases/database/images";
import { IImageData } from "@/api/interfaces/image";
import {
  createImageStorage,
  getImageObjectURL,
  getImageStorage,
  getImageStorageByObjectName,
  uploadToImageStorage,
} from "@/api/usecases/storage/images";
import { ImageTemplateEngine } from "@/api/utils/image-template-engine";
import { nanoid } from "nanoid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method?.toLowerCase()) {
    case "get":
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
 * generate() will generate image based on the source URL along with the options passed to the params
 * provided in the request body
 * @param req Next API Request
 * @param res Next API Response
 * @returns either the URL of the image or image itself
 */
async function generate(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Generate a nanoid
    const nanoID = nanoid(16);

    // Get the request search params
    const query = req.query;

    // Preprocess the URL params
    const params = {
      source: query.source,
      templateID: query.templateID,
      target: query.target,
      sig: query.sig,
      dl: query.dl,
    };

    // Check if source is available
    if (!params.source) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Source is required!",
          data: null,
        },
      });
    }
    const url = params.source as string;

    // Get the metadata
    const result = await parser(url);

    // Check if there is any existing data
    const { data: found, error: findError } = await getImageDataByURL(
      result.meta.url || result.og.url || url
    );

    // If exists, return from Database
    // Else, fetch from the URL
    let metadata: IImageData;
    if (found && found.length === 1 && !findError) {
      console.debug("Image Metadata found. Using previous data...");
      const [foundMetadata] = found;
      metadata = foundMetadata;
    } else {
      console.debug("Image Metadata not found. Generating...");
      metadata = {
        unique_id: nanoID,
        url: result.meta.url || result.og.url || url,
        title: result.meta.title || result.og.title || "",
        description: result.meta.description || result.og.description,
        image: result.images?.[0] || result.og.image,
        site_name: result.meta.site_name || result.og.site_name,
        type: result.meta.type || result.og.type,
      };

      // Create a new entry in the database
      const { error: createError } = await createImageData(metadata);

      if (createError) {
        throw new Error(createError.message);
      }
    }

    // Check if image is already generated
    let imageURL: string;
    let outputPath: string = "";
    const fileName = `${found?.[0]?.unique_id || nanoID}_${
      params.templateID
    }.png`;
    const { data: imageData, error: imageError } =
      await getImageStorageByObjectName(fileName);

    if (imageData && !imageError) {
      console.debug("Generated image found. Using previous data...");
      imageURL = await getImageObjectURL(fileName);
    } else {
      console.debug("Generated image not found. Generating...");
      // Check if the template exists
      if (!fs.existsSync(path.resolve(`templates/${params.templateID}.html`))) {
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
      outputPath = await ITE.generate(
        parseInt(params.templateID as string, 10) || 1,
        fileName
      );

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
    }

    if (parseInt(params.dl as string, 10) === 1) {
      return handleFileResponse(res, fs.readFileSync(outputPath));
    } else {
      return handleResponse(res, {
        status: StatusCodes.OK,
        body: {
          message: "Successfully created an image",
          data: imageURL,
        },
      });
    }
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

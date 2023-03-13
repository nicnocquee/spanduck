import fs from "fs";
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
  updateImageDataByID,
} from "@/api/usecases/database/images";
import { IImageData } from "@/api/interfaces/image";
import { getImageObjectURL } from "@/api/usecases/storage/images";
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

    // Check if there is any existing metadata
    const { data: found, error: findError } = await getImageDataByURL(
      result.meta.url || result.og.url || url
    );

    // Update the data if metadata found
    // Create the data if metadata not found
    let metadata: IImageData = {
      unique_id: nanoID,
      url: result.meta.url || result.og.url || url,
      title: result.meta.title || result.og.title || "",
      description: result.meta.description || result.og.description,
      image: result.images?.[0] || result.og.image,
      site_name: result.meta.site_name || result.og.site_name,
      type: result.meta.type || result.og.type,
    };

    if (found && found.length === 1 && !findError) {
      const { error: updateError } = await updateImageDataByID(
        found[0].id,
        metadata
      );

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: createError } = await createImageData(metadata);

      if (createError) {
        throw new Error(createError.message);
      }
    }

    // Generate image
    let imageURL: string;
    const fileName = `${found?.[0]?.unique_id || nanoID}_${
      params.templateID
    }.png`;

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

    // Render and upload the image
    const ITE = new ImageTemplateEngine(metadata);
    await ITE.generate(
      parseInt(params.templateID as string, 10) || 1,
      fileName
    );

    // Get download URL for image
    imageURL = await getImageObjectURL(fileName);

    return handleResponse(res, {
      status: StatusCodes.OK,
      body: {
        message: "Successfully created an image",
        data: imageURL,
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

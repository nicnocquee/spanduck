import {
  CreateGeneratedImageSchema,
  TwitterImageMetadataSchemaType,
  WebImageMetadataSchemaType,
} from "@/api/schemas/generated-image";
import {
  createGeneratedImage,
  getGeneratedImages,
} from "@/api/usecases/database/generated-image";
import generateImageFromTwitter from "@/api/utils/generate-image-from-twitter";
import generateImageFromURL from "@/api/utils/generate-image-from-url";
import handleResponse from "@/api/utils/handle-response";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method?.toLowerCase()) {
    case "get":
      await get(req, res);
      break;
    case "post":
      await post(req, res);
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

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get query params
    const { query } = req;
    const hasQuery = Object.keys(query).length > 0;

    // Get data based on query params
    // If ther is none, proceed with default values
    const { error, ...data } = await getGeneratedImages(
      hasQuery ? query : undefined
    );

    if (error) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Failed to get the generated images",
          error,
          ...data,
        },
      });
    }

    return handleResponse(res, {
      status: StatusCodes.OK,
      body: {
        message: "Successfully get the generated images",
        error,
        ...data,
      },
    });
  } catch (e: any) {
    return handleResponse(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      body: {
        message: "Internal server error",
        data: null,
        error: e,
      },
    });
  }
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate the request body
    const { body } = req;
    const validated = await CreateGeneratedImageSchema.parseAsync(body);
    const { project_id, url, template_id, type, user_id } = validated;

    let generatedData: {
      image: string;
      image_metadata:
        | WebImageMetadataSchemaType
        | TwitterImageMetadataSchemaType;
      fileName: string;
    };

    // Generate image based on the type
    if (type === "url") {
      const { image, image_metadata, fileName } = await generateImageFromURL({
        url,
        template_id,
        user_id,
        project_id,
      });

      generatedData = {
        image,
        image_metadata,
        fileName,
      };
    } else {
      const { image, image_metadata, fileName } =
        await generateImageFromTwitter({
          url,
          template_id,
          user_id,
          project_id,
        });

      generatedData = {
        image,
        image_metadata,
        fileName,
      };
    }

    // Store the created image in the database
    const { error, ...data } = await createGeneratedImage({
      name: generatedData.fileName,
      image_metadata: generatedData.image_metadata,
      image: generatedData.image,
      project_id,
      template_id,
      type,
      url,
      user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toString(),
    });

    if (error) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Failed to create the generated image",
          error,
          ...data,
        },
      });
    }

    return handleResponse(res, {
      status: StatusCodes.CREATED,
      body: {
        message: "Successfully created the generated image",
        error,
        ...data,
      },
    });
  } catch (e: any) {
    return handleResponse(res, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      body: {
        message: "Internal server error",
        data: null,
        error: e,
      },
    });
  }
}

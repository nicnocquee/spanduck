import {
  deleteGeneratedImageByID,
  getGeneratedImageByID,
} from "@/api/usecases/database/generated-image";
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
    case "delete":
      await remove(req, res);
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
    // Check for ID in query params
    const { id } = req.query;
    if (!id) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Generated image ID is required.",
          data: null,
          error: null,
        },
      });
    }

    // Get generated image by ID
    const generatedImageID = parseInt(id as string, 10);
    const { error, ...data } = await getGeneratedImageByID(generatedImageID);

    return handleResponse(res, {
      status: StatusCodes.OK,
      body: {
        message: "Successfully get the generated image by ID",
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

async function remove(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check for ID in query params
    const { id } = req.query;
    if (!id) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Generated image ID is required.",
          data: null,
          error: null,
        },
      });
    }

    // Find the generated image by ID
    const generatedImageID = parseInt(id as string, 10);
    const { error: findError, data: findData } = await getGeneratedImageByID(
      generatedImageID
    );
    if (findError) {
      return handleResponse(res, {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        body: {
          message: "Cannot find the generated image",
          data: null,
          error: findError,
        },
      });
    }
    if (findData.length < 1) {
      return handleResponse(res, {
        status: StatusCodes.NOT_FOUND,
        body: {
          message: "Generated image not found.",
          data: null,
          error: findError,
        },
      });
    }

    // If found, delete the generated image
    const { error, ...data } = await deleteGeneratedImageByID(generatedImageID);

    return handleResponse(res, {
      status: StatusCodes.NO_CONTENT,
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

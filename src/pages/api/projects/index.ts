import { ProjectCreateEditSchema } from "@/api/schemas/project";
import { createProject, getProjects } from "@/api/usecases/database//project";
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
    const { error, ...data } = await getProjects(hasQuery ? query : undefined);

    if (error) {
      console.error(error);
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Failed to get the projects",
          error,
          ...data,
        },
      });
    }

    return handleResponse(res, {
      status: StatusCodes.OK,
      body: {
        message: "Successfully get the projects",
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
    const validated = await ProjectCreateEditSchema.parseAsync(body);

    // Insert data to the database
    const { error, ...data } = await createProject(validated);

    if (error) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Failed to create the project",
          error,
          ...data,
        },
      });
    }

    return handleResponse(res, {
      status: StatusCodes.CREATED,
      body: {
        message: "Successfully created the project",
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

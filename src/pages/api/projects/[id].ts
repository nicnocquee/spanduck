import { ProjectSchema } from "@/api/schemas/project";
import {
  deleteProject,
  editProject,
  getProjectByID,
} from "@/api/usecases/database/project";
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
    case "put":
      await put(req, res);
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
    const { id } = req.query;
    if (!id) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Project ID is required.",
          data: null,
          error: null,
        },
      });
    }

    const projectID = parseInt(id as string, 10);
    const { error, ...data } = await getProjectByID(projectID);

    return handleResponse(res, {
      status: StatusCodes.OK,
      body: {
        message: "Successfully get the project by ID",
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

async function put(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body } = req;
    const { id } = req.query;
    if (!id) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Project ID is required.",
          data: null,
          error: null,
        },
      });
    }

    const projectID = parseInt(id as string, 10);
    const { error: findError, data: findData } = await getProjectByID(
      projectID
    );
    if (findError) {
      return handleResponse(res, {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        body: {
          message: "Cannot find the project",
          data: null,
          error: findError,
        },
      });
    }
    if (findData.length < 1) {
      return handleResponse(res, {
        status: StatusCodes.NOT_FOUND,
        body: {
          message: "Project not found.",
          data: null,
          error: findError,
        },
      });
    }

    const validated = await ProjectSchema.parseAsync(body);
    const { error, ...data } = await editProject(projectID, validated);

    return handleResponse(res, {
      status: StatusCodes.ACCEPTED,
      body: {
        message: "Successfully edit the project by ID",
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
    const { id } = req.query;
    if (!id) {
      return handleResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        body: {
          message: "Project ID is required.",
          data: null,
          error: null,
        },
      });
    }

    const projectID = parseInt(id as string, 10);
    const { error: findError, data: findData } = await getProjectByID(
      projectID
    );
    if (findError) {
      return handleResponse(res, {
        status: StatusCodes.UNPROCESSABLE_ENTITY,
        body: {
          message: "Cannot find the project",
          data: null,
          error: findError,
        },
      });
    }
    if (findData.length < 1) {
      return handleResponse(res, {
        status: StatusCodes.NOT_FOUND,
        body: {
          message: "Project not found.",
          data: null,
          error: findError,
        },
      });
    }

    const { error, ...data } = await deleteProject(projectID);

    return handleResponse(res, {
      status: StatusCodes.NO_CONTENT,
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

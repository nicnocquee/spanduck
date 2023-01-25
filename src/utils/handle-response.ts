import { NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";

interface IResponseData {
  status: StatusCodes;
  body?: object;
}

export default function handleResponse(
  res: NextApiResponse,
  data: IResponseData
) {
  const { status, body } = data;
  return res.status(status).json(body);
}

import axios from "axios";

export default function fetcher() {
  return axios.create({
    baseURL: "/api",
  });
}

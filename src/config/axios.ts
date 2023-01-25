import axios from "axios";
import { config } from "./env";

export const SupabaseFunctionsClient = axios.create({
  baseURL: config.supabaseFunctionsBaseURL,
  headers: {
    Authorization: `Bearer ${config.supabasePublicAnonKey}`,
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

import { ERROR_MISSING_ENV } from "@/constants/errors";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!url) throw new Error(ERROR_MISSING_ENV("NEXT_PUBLIC_SUPABASE_URL"));
if (!key) throw new Error(ERROR_MISSING_ENV("NEXT_PUBLIC_SUPABASE_KEY"));

export const supabase = createClient(url, key);

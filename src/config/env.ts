type Config = {
  supabaseURL: string;
  supabasePublicAnonKey: string;
  supabaseFunctionsBaseURL: string;
};

export const config: Config = {
  supabaseURL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabasePublicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_KEY || "",
  supabaseFunctionsBaseURL: process.env.SUPABASE_FUNCTIONS_BASE_URL || "",
};

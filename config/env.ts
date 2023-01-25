type Config = {
  supabaseURL: string;
  supabasePublicAnonKey: string;
  supabaseFunctionsBaseURL: string;
};

export const config: Config = {
  supabaseURL: process.env.SUPABASE_URL || "",
  supabasePublicAnonKey: process.env.SUPABASE_PUBLIC_ANON_KEY || "",
  supabaseFunctionsBaseURL: process.env.SUPABASE_FUNCTIONS_BASE_URL || "",
};

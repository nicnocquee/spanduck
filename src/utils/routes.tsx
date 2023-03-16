import { config } from "@/api/config/env";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";

export const hasUserSession = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx, {
    supabaseKey: config.supabasePublicAnonKey,
    supabaseUrl: config.supabaseURL,
  });
  // Check if we have a session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  return true;
};

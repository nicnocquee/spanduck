import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { config } from "@/api/config/env";
import { GetServerSidePropsContext } from "next";

export default function serverSupabaseClient(ctx: GetServerSidePropsContext) {
  return createServerSupabaseClient(ctx, {
    supabaseKey: config.supabasePublicAnonKey,
    supabaseUrl: config.supabaseURL,
  });
}

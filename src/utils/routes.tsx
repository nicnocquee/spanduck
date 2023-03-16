import serverSupabaseClient from "@/api/utils/server-supabase-client";
import { GetServerSidePropsContext } from "next";

export const hasUserSession = async (ctx: GetServerSidePropsContext) => {
  // Check if we have a session
  const {
    data: { user },
  } = await serverSupabaseClient(ctx).auth.getUser();

  if (!user) return false;

  return true;
};

import { PremiumSchema } from "@/api/schemas/premium";
import { supabase } from "@/api/utils/supabase";

export async function getPremiumByUserID(userID: string) {
  return await supabase
    .from("premium")
    .select("*", {
      count: "exact",
    })
    .eq("user_id", userID);
}

export async function createPremiumUser(body: PremiumSchema) {
  return supabase
    .from("premium")
    .insert({
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .select();
}

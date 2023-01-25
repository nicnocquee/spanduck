import { ITwitterData, ITwitterDataBody } from "@/interfaces/twitter";
import { supabase } from "@/lib/supabase";

export async function getTwitterData() {
  return await supabase.from("twitter").select("*");
}

export async function getTwitterDataByTweetID(tweetID: string) {
  return await supabase
    .from("twitter")
    .select("*")
    .eq("tweet_id", tweetID)
    .limit(1);
}

export async function createTwitterData(body: ITwitterDataBody) {
  return await supabase.from("twitter").insert(body);
}

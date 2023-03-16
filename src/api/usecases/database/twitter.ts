import { ITwitterDataBody } from "@/api/interfaces/twitter";
import { supabase } from "@/api/utils/supabase";

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
  return await supabase.from("twitter").insert(body).select();
}

export async function updateTwitterDataByTweetID(
  tweetID: string,
  body: ITwitterDataBody
) {
  return await supabase
    .from("twitter")
    .update(body)
    .eq("tweet_id", tweetID)
    .select();
}

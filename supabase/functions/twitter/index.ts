import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import * as log from "https://deno.land/std@0.172.0/log/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

interface Attachments {
  media_keys: string[];
}

interface Data {
  attachments: Attachments;
  author_id: string;
  edit_history_tweet_ids: string[];
  text: string;
  id: string;
}

interface Medium {
  media_key: string;
  type: string;
  url: string;
}

interface User {
  name: string;
  profile_image_url: string;
  id: string;
  username: string;
}

interface Includes {
  media: Medium[];
  users: User[];
}

interface TwitterResponse {
  data: Data;
  includes: Includes;
}

function returnResponse(body: Record<string, unknown>, statusCode: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: statusCode,
  });
}

function healthCheck() {
  return returnResponse({ status: "OK" }, 200);
}

async function getData(tweetURL: string): Promise<Response> {
  try {
    // Validate URL
    const { hostname, pathname } = new URL(tweetURL);
    if (hostname !== "twitter.com") {
      return returnResponse({ error: "Not a valid Twitter URL" }, 422);
    }

    // Get the Tweet ID
    const tweetID = pathname.split("/").pop();
    const params =
      "tweet.fields=text&expansions=author_id,attachments.media_keys&media.fields=media_key,url&user.fields=name,username,profile_image_url";
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${tweetID}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("TWITTER_BEARER_TOKEN")}`,
        },
      }
    );

    let result = {};
    // Sanitize the data
    if (response.status === 200) {
      const data: TwitterResponse = await response.json();

      result = {
        tweet_url: tweetURL,
        username: data.includes.users[0].username,
        avatar: data.includes.users[0].profile_image_url,
        display_name: data.includes.users[0].name,
        content: data.data.text,
        images: data.includes.media?.map((media) => media.url),
      };
    }

    return returnResponse(result, 200);
  } catch (e) {
    throw new Error(e?.message);
  }
}

serve(async (req): Promise<Response> => {
  const { method, url, headers } = req;

  log.info({ method, url, headers });

  // This is needed if you're planning to invoke your function from a browser.
  if (method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let tweetURL = "";
    if (method === "POST" || method === "PUT") {
      const body = await req.json();
      tweetURL = body.twitter_url;
    }

    // call relevant method based on method and id
    switch (true) {
      case method === "POST":
        return getData(tweetURL);
      default:
        return healthCheck();
    }
  } catch (error) {
    log.error(error);

    return returnResponse({ error: error.message }, 500);
  }
});

log.info(`HTTP webserver running. Access it at:  http://localhost:8000/`);

export interface ITwitterData {
  tweet_url: string;
  username: string;
  avatar: string;
  display_name: string;
  content: string;
  images: string[];
}

export interface ITwitterDataBody extends ITwitterData {
  tweet_id: string;
}

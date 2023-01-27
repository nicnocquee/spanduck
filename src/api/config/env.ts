type Config = {
  supabaseURL: string;
  supabasePublicAnonKey: string;
  supabaseFunctionsBaseURL: string;
  stripeSingleWebhookSecret: string;
  stripeSubscriptionWebhookSigningSecret: string;
  stripeSecretKey: string;
  spanduckProStripeProductId: string;
};

export const config: Config = {
  supabaseURL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabasePublicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_KEY || "",
  supabaseFunctionsBaseURL: process.env.SUPABASE_FUNCTIONS_BASE_URL || "",
  stripeSingleWebhookSecret:
    process.env.STRIPE_SIGNING_SECRET_SINGLE_WEBHOOK || "",
  stripeSubscriptionWebhookSigningSecret:
    process.env.STRIPE_SIGNING_SECRET_SUBSCRIPTION_WEBHOOK || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  spanduckProStripeProductId: process.env.SPANDUCK_PRO_STRIPE_PRODUCT_ID || "",
};

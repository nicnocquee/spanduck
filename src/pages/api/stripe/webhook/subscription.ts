// This webhook should handle when user's subscription changes say the subscription is automatically renewed.
// On receiving this, set the user's pro plan end date to when the subscription will end.

import Stripe from "stripe";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { config as envConfig } from "../../../../api/config/env";

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(envConfig.stripeSecretKey, {
    apiVersion: "2022-11-15",
  });
  const signature = req.headers["stripe-signature"] as string;
  const reqBuffer = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature,
      envConfig.stripeSubscriptionWebhookSigningSecret
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  console.log(event);

  res.send({ received: true });
};

export default handler;

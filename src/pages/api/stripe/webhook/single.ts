// This webhook should handle when user pays only once for 1 month.
// On receiving this, set the user's pro plan end date to one month after this date.

import Stripe from "stripe";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { config as envConfig } from "../../../../../src/api/config/env";
import { addMonths } from "date-fns";

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
      envConfig.stripeSingleWebhookSecret
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  const schema = z.object({
    id: z.string(),
    object: z.string(),
    livemode: z.boolean(),
    type: z.string(), // "checkout.session.completed"
    data: z.object({
      object: z.object({
        id: z.string(),
        object: z.string(),
        amount_total: z.number(),
        amount_subtotal: z.number(),
        created: z.number(),
        customer: z.string(),
        customer_details: z.object({
          email: z.string(),
          name: z.string().nullable(),
        }),
        livemode: z.boolean(),
        payment_intent: z.string().nullable(),
        payment_link: z.string().nullable(),
        payment_status: z.string(), //'paid',
        status: z.string(), // complete
      }),
    }),
  });

  try {
    const parsedEvent = schema.parse(event);
    console.dir(parsedEvent, { depth: null });

    if (
      parsedEvent.type === "checkout.session.completed" &&
      parsedEvent.data.object.status === "complete" &&
      parsedEvent.data.object.payment_status === "paid" &&
      parsedEvent.data.object.payment_intent
    ) {
      const session = await stripe.checkout.sessions.retrieve(
        parsedEvent.data.object.id,
        {
          expand: ["line_items"],
        }
      );

      const item = session?.line_items?.data?.[0];
      const productId = item?.price?.product as string;
      const product = await stripe.products.retrieve(productId);

      if (product.id === envConfig.spanduckProStripeProductId) {
        const email = parsedEvent.data.object.customer_details.email;
        const proUntil = addMonths(new Date(), 1);
        console.log({ email, proUntil });
        // update the user with the email proUntil
      }
    }
  } catch (error) {
    if (event.type === "checkout.session.completed") {
      console.dir(error, { depth: null });
      return res.status(403).send("ng");
    }
  }

  res.send({ received: true });
};

export default handler;

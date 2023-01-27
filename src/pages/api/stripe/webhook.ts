import Stripe from "stripe";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2022-11-15",
  });
  const signature = req.headers["stripe-signature"] as string;
  const signingSecret = process.env.STRIPE_SIGNING_SECRET || "";
  const reqBuffer = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
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
      id: z.string(),
      object: z.string(),
      amount_total: z.number(),
      amount_subtotal: z.number(),
      created: z.number(),
      customer: z.string(),
      customer_details: z.object({
        email: z.string(),
        name: z.string(),
      }),
      livemode: z.boolean(),
      payment_intent: z.string(),
      payment_link: z.string(),
      payment_status: z.string(), //'paid',
      status: z.string(), // complete
    }),
  });

  const parsedEvent = schema.parse(event);

  /*
{
  "id": "evt_1MUsgCKw1WOEy4mk00EmXbfD",
  "object": "event",
  "api_version": "2022-11-15",
  "created": 1674828804,
  "data": {
    "object": {
      "id": "cs_test_a1Z0vzfWhO0Ny7IyYmw95HRO16SJdg4tU1S8ZMjJPfqRFHaMJyppHWn7kT",
      "object": "checkout.session",
      "after_expiration": null,
      "allow_promotion_codes": false,
      "amount_subtotal": 2000,
      "amount_total": 2000,
      "automatic_tax": {
        "enabled": false,
        "status": null
      },
      "billing_address_collection": "auto",
      "cancel_url": "https://stripe.com",
      "client_reference_id": null,
      "consent": null,
      "consent_collection": {
        "promotions": "none",
        "terms_of_service": "none"
      },
      "created": 1674828786,
      "currency": "usd",
      "custom_text": {
        "shipping_address": null,
        "submit": null
      },
      "customer": "cus_NFNROjPcoeXXhy",
      "customer_creation": "always",
      "customer_details": {
        "address": {
          "city": null,
          "country": "CH",
          "line1": null,
          "line2": null,
          "postal_code": null,
          "state": null
        },
        "email": "captain.ronan@gmail.com",
        "name": "joey tribitioan",
        "phone": null,
        "tax_exempt": "none",
        "tax_ids": [
        ]
      },
      "customer_email": null,
      "expires_at": 1674915185,
      "invoice": null,
      "invoice_creation": {
        "enabled": false,
        "invoice_data": {
          "account_tax_ids": null,
          "custom_fields": null,
          "description": null,
          "footer": null,
          "metadata": {
          },
          "rendering_options": null
        }
      },
      "livemode": false,
      "locale": "auto",
      "metadata": {
      },
      "mode": "payment",
      "payment_intent": "pi_3MUsg9Kw1WOEy4mk0NRevlp7",
      "payment_link": "plink_1MUpLjKw1WOEy4mksIOS56Pi",
      "payment_method_collection": "always",
      "payment_method_options": {
      },
      "payment_method_types": [
        "card"
      ],
      "payment_status": "paid",
      "phone_number_collection": {
        "enabled": false
      },
      "recovered_from": null,
      "setup_intent": null,
      "shipping_address_collection": null,
      "shipping_options": [
      ],
      "status": "complete",
      "submit_type": "auto",
      "subscription": null,
      "success_url": "https://stripe.com",
      "total_details": {
        "amount_discount": 0,
        "amount_shipping": 0,
        "amount_tax": 0
      },
      "url": null,
      "shipping_cost": null,
      "shipping_details": null
    }
  },
  "livemode": false,
  "pending_webhooks": 3,
  "request": {
    "id": null,
    "idempotency_key": null
  },
  "type": "checkout.session.completed"
}
  */

  console.dir(parsedEvent, { depth: null });

  res.send({ received: true });
};

export default handler;

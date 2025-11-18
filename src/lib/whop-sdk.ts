import { Whop } from "@whop/sdk";

export const whopSdk = new Whop({
  apiKey: process.env.WHOP_API_KEY,
});


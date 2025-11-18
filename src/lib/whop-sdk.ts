import { Whop } from "@whop/sdk";

export const whopSdk = new Whop({
  token: process.env.WHOP_API_KEY!,
});


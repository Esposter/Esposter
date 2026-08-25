import { pushSubscriptions } from "@esposter/db-schema";

export const PUSH_SUBSCRIPTION_COLUMNS = Object.freeze({
  auth: pushSubscriptions.auth,
  endpoint: pushSubscriptions.endpoint,
  expirationTime: pushSubscriptions.expirationTime,
  id: pushSubscriptions.id,
  p256dh: pushSubscriptions.p256dh,
});

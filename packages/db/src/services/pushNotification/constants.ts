import { pushSubscriptionsInMessage } from "@esposter/db-schema";

export const PUSH_SUBSCRIPTION_COLUMNS = Object.freeze({
  auth: pushSubscriptionsInMessage.auth,
  endpoint: pushSubscriptionsInMessage.endpoint,
  expirationTime: pushSubscriptionsInMessage.expirationTime,
  id: pushSubscriptionsInMessage.id,
  p256dh: pushSubscriptionsInMessage.p256dh,
});

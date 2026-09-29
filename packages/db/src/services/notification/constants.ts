import { pushSubscriptionsInNotification } from "@esposter/db-schema";

export const PUSH_SUBSCRIPTION_COLUMNS = Object.freeze({
  auth: pushSubscriptionsInNotification.auth,
  endpoint: pushSubscriptionsInNotification.endpoint,
  expirationTime: pushSubscriptionsInNotification.expirationTime,
  id: pushSubscriptionsInNotification.id,
  p256dh: pushSubscriptionsInNotification.p256dh,
});

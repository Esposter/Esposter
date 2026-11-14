import { pushSubscriptionsInNotification } from "@esposter/db-schema";

// A device read carries its user ids as one JSON array, so this bounds the size of one wave's statement rather than a
// bind parameter count. A room the size of the cap is read in a single round trip
export const MAX_USER_IDS_PER_STATEMENT = 10_000;

export const PUSH_SUBSCRIPTION_COLUMNS = Object.freeze({
  auth: pushSubscriptionsInNotification.auth,
  endpoint: pushSubscriptionsInNotification.endpoint,
  expirationTime: pushSubscriptionsInNotification.expirationTime,
  id: pushSubscriptionsInNotification.id,
  p256dh: pushSubscriptionsInNotification.p256dh,
});

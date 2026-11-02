import { pushSubscriptionsInNotification } from "@esposter/db-schema";

// Postgres caps a statement at 65,535 bind parameters, and a device read binds one per user, so a room is read in waves
// of this many, well under the cap: a room the size of the cap is seven round trips
export const MAX_USER_IDS_PER_STATEMENT = 10_000;

export const PUSH_SUBSCRIPTION_COLUMNS = Object.freeze({
  auth: pushSubscriptionsInNotification.auth,
  endpoint: pushSubscriptionsInNotification.endpoint,
  expirationTime: pushSubscriptionsInNotification.expirationTime,
  id: pushSubscriptionsInNotification.id,
  p256dh: pushSubscriptionsInNotification.p256dh,
});

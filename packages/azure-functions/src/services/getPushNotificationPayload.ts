import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { truncate } from "@esposter/shared";
// The payload shape the service worker parses, stated once. The body is capped and the deep link is made
// Absolute here rather than by each sender, so neither is something a new notification can forget: `path` is
// The in-app route, and everything a push carries beyond it is this envelope.
export const getPushNotificationPayload = ({
  body,
  icon,
  path,
  title,
}: {
  body: string;
  icon?: null | string;
  path: string;
  title?: null | string;
}): string =>
  JSON.stringify({
    body: truncate(body, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
    data: { url: `${process.env.BASE_URL}${path}` },
    icon,
    title,
  });

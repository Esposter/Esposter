import type { AppNotificationType, NotificationSeverity, PushNotificationPayload } from "@esposter/db-schema";

import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { truncate } from "@esposter/shared";
// The payload shape the service worker parses, stated once. The body is capped and the deep link is made
// Absolute here rather than by each sender, so neither is something a new notification can forget: `path` is
// The in-app route, and everything a push carries beyond it is this envelope.
//
// `severity` and `type` ride in `data` alongside the url, because the service worker hands the whole payload to
// Every open tab: that is how a tab knows a delivered push is one its bell is meant to show, without asking the
// Server what just arrived.
export const getPushNotificationPayload = ({
  body,
  icon,
  path,
  severity,
  title,
  type,
}: {
  body: string;
  icon?: null | string;
  path: string;
  severity: NotificationSeverity;
  title?: null | string;
  type: AppNotificationType;
}): string =>
  JSON.stringify({
    body: truncate(body, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
    data: { severity, type, url: `${process.env.BASE_URL}${path}` },
    icon,
    title,
  } satisfies PushNotificationPayload);

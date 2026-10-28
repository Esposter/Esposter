import type { AppNotificationType } from "#src/models/notification/AppNotificationType";
import type { NotificationSeverity } from "#src/models/notification/NotificationSeverity";

import { appNotificationTypeSchema } from "#src/models/notification/AppNotificationType";
import { notificationSeveritySchema } from "#src/models/notification/NotificationSeverity";
import { z } from "zod";

// What a push carries, declared where both ends can read it: the Function serialises this, and the tab the
// Service worker hands it to parses it back. `data` is the Notification API's own passthrough field, which is
// Why the deep link and the two registry keys ride there rather than as options the browser would ignore.
export interface PushNotificationPayload {
  body: string;
  data: { severity: NotificationSeverity; type: AppNotificationType; url: string };
  icon?: null | string;
  title?: null | string;
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the data's severity and type are zod enum schemas, which carry typeof NotificationSeverity and typeof AppNotificationType rather than the enum types the interface names, so the rule cannot see them in this value
export const pushNotificationPayloadSchema = z.object({
  body: z.string(),
  data: z.object({ severity: notificationSeveritySchema, type: appNotificationTypeSchema, url: z.string() }),
  icon: z.string().nullish(),
  title: z.string().nullish(),
}) satisfies z.ZodType<PushNotificationPayload>;

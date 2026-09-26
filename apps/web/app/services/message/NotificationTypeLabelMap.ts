import { NotificationType } from "@esposter/db-schema";

export const NotificationTypeLabelMap = {
  [NotificationType.All]: "All Messages",
  [NotificationType.DirectMessage]: "Only @mentions",
  [NotificationType.Never]: "Nothing",
} as const satisfies Record<NotificationType, string>;

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NotificationType } from "@esposter/db-schema";

export const NotificationTypeMeaningMap = {
  [NotificationType.All]: UiIconMeaning.Notifications,
  [NotificationType.DirectMessage]: UiIconMeaning.Mention,
  [NotificationType.Never]: UiIconMeaning.NotificationsOff,
} as const satisfies Record<NotificationType, UiIconMeaning>;

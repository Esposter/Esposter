import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { NotificationSeverity } from "#src/models/notification/NotificationSeverity";

// The severity a published notification is stamped with. Server-published notifications never carry one on the
// Wire — the type already says what happened, so the icon and colour follow from it rather than from a field
// Every publisher would have to restate identically.
export const AppNotificationTypeSeverityMap = {
  [AppNotificationType.FriendRequest]: NotificationSeverity.Info,
  [AppNotificationType.Message]: NotificationSeverity.Info,
  [AppNotificationType.Reminder]: NotificationSeverity.Info,
  [AppNotificationType.ResourceOperation]: NotificationSeverity.Success,
  [AppNotificationType.TodoReminder]: NotificationSeverity.Warning,
} as const satisfies Record<AppNotificationType, NotificationSeverity>;

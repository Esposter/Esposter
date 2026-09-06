import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { NotificationChannel } from "#src/models/notification/NotificationChannel";

// Which surfaces each notification type reaches, declared once. This is what makes "every notification goes
// Through one system" true without also pushing every kind of notification to a phone: ProcessNotification
// Resolves recipients the same way for all of them and then consults this map to decide what to deliver.
//
// Exhaustive over AppNotificationType on purpose — a new type has to state its surfaces rather than inherit a
// Default that silently drops it from the bell or wakes a device it had no business waking.
export const AppNotificationTypeChannelMap: Record<AppNotificationType, readonly NotificationChannel[]> = {
  [AppNotificationType.FriendRequest]: [NotificationChannel.Bell, NotificationChannel.Push],
  // Push only: a room already carries its own unread count and mention badge, so a bell row per chat message
  // Would duplicate a surface that is both more precise and already read where the conversation is.
  [AppNotificationType.Message]: [NotificationChannel.Push],
  [AppNotificationType.Reminder]: [NotificationChannel.Bell, NotificationChannel.Push],
  [AppNotificationType.ResourceOperation]: [NotificationChannel.Bell, NotificationChannel.Push],
  [AppNotificationType.TodoReminder]: [NotificationChannel.Bell, NotificationChannel.Push],
};

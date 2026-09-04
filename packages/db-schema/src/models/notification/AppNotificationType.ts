import { z } from "zod";
// Every kind of notification this system publishes. One member per kind, and the registries keyed on it
// (AppNotificationTypeChannelMap, AppNotificationTypeSeverityMap) are exhaustive, so a new kind that forgets to say where it
// Renders is a type error rather than a notification nobody ever sees.
//
// Client-only feedback — a mutation error, a save conflict, an export that finished in this tab — is not a member:
// It never leaves the tab it happened in, so it has no channels to declare and nothing to resolve recipients for.
export enum AppNotificationType {
  FriendRequest = "FriendRequest",
  Message = "Message",
  Reminder = "Reminder",
  ResourceOperation = "ResourceOperation",
  TodoReminder = "TodoReminder",
}

export const appNotificationTypeSchema = z.enum(AppNotificationType) satisfies z.ZodType<AppNotificationType>;

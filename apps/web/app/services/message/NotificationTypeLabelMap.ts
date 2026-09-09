import { NotificationType } from "@esposter/db-schema";

export const NotificationTypeLabelMap = {
  [NotificationType.All]: "All Messages",
  [NotificationType.DirectMessage]: "Only @mentions",
  [NotificationType.Never]: "Nothing",
} as const satisfies Record<NotificationType, string>;
// Derived at the map rather than at the radio group that renders it, so the pairs and the labels they
// Come from cannot drift apart
export const NotificationTypeLabelEntries = Object.entries(NotificationTypeLabelMap);

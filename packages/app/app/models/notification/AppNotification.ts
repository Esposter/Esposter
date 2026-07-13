import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";
import type { VAlert } from "vuetify/components";

export interface AppNotification {
  action?: AppNotificationAction;
  createdAt: Date;
  id: string;
  isRead: boolean;
  message?: string;
  severity: NonNullable<VAlert["$props"]["type"]>;
  title: string;
}

import type { AppNotification } from "@/models/notification/AppNotification";

export const NotificationSeverityIconMap = {
  error: "mdi-alert-circle",
  info: "mdi-information",
  success: "mdi-check-circle",
  warning: "mdi-alert",
} as const satisfies Record<AppNotification["severity"], string>;

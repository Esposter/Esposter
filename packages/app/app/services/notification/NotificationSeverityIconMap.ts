import type { AppNotification } from "@/models/notification/AppNotification";

import { NotificationSeverity } from "@esposter/db-schema";

export const NotificationSeverityIconMap = {
  [NotificationSeverity.Error]: "mdi-alert-circle",
  [NotificationSeverity.Info]: "mdi-information",
  [NotificationSeverity.Success]: "mdi-check-circle",
  [NotificationSeverity.Warning]: "mdi-alert",
} as const satisfies Record<AppNotification["severity"], string>;

// @unocss-include
import type { AppNotification } from "@/models/notification/AppNotification";

import { NotificationSeverity } from "@esposter/db-schema";

export const NotificationSeverityIconMap = {
  [NotificationSeverity.Error]: "i-mdi:alert-circle",
  [NotificationSeverity.Info]: "i-mdi:information",
  [NotificationSeverity.Success]: "i-mdi:check-circle",
  [NotificationSeverity.Warning]: "i-mdi:alert",
} as const satisfies Record<AppNotification["severity"], string>;

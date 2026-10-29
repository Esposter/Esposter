import type { UsageWindow } from "../../models/UsageWindow";

import {
  FIVE_HOUR_MAINTENANCE_PERCENTAGE,
  FIVE_HOUR_WINDOW_MS,
  WEEKLY_MAINTENANCE_PERCENTAGE,
  WEEKLY_WINDOW_MS,
} from "../constants";

// The rate-limit windows a reserve is read off, five-hour before weekly, so the five-hour one is the one named when both
// Have passed their line
export const RateLimitKindUsageWindowMap: Record<string, UsageWindow> = {
  five_hour: {
    durationMs: FIVE_HOUR_WINDOW_MS,
    maintenancePercentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
    name: "five-hour",
  },
  seven_day: { durationMs: WEEKLY_WINDOW_MS, maintenancePercentage: WEEKLY_MAINTENANCE_PERCENTAGE, name: "weekly" },
};

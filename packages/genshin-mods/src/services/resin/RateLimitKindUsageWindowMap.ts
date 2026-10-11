import type { UsageWindow } from "../../models/UsageWindow";

import {
  FIVE_HOUR_MAINTENANCE_PERCENTAGE,
  FIVE_HOUR_WIND_DOWN_PERCENTAGE,
  WEEKLY_WIND_DOWN_PERCENTAGE,
} from "../constants";

// The rate-limit windows a reserve is read off, five-hour before weekly, so the five-hour one is the one named when both
// Have passed a line of the same tier
export const RateLimitKindUsageWindowMap: Record<string, UsageWindow> = {
  five_hour: {
    maintenancePercentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
    name: "five-hour",
    windDownPercentage: FIVE_HOUR_WIND_DOWN_PERCENTAGE,
  },
  seven_day: { name: "weekly", windDownPercentage: WEEKLY_WIND_DOWN_PERCENTAGE },
};

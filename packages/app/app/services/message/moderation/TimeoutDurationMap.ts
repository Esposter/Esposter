/* eslint-disable perfectionist/sort-objects */
import { DAY, HOUR, MINUTE } from "@esposter/shared";

export const TimeoutDurationMap = {
  "1 minute": MINUTE,
  "5 minutes": 5 * MINUTE,
  "10 minutes": 10 * MINUTE,
  "1 hour": HOUR,
  "24 hours": 24 * HOUR,
  "7 days": 7 * DAY,
} as const satisfies Record<string, number>;

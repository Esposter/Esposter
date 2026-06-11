/* eslint-disable perfectionist/sort-objects */
import { dayjs } from "#shared/services/dayjs";

export const TimeoutDurationMap = {
  "1 minute": dayjs.duration(1, "minute").asMilliseconds(),
  "5 minutes": dayjs.duration(5, "minutes").asMilliseconds(),
  "10 minutes": dayjs.duration(10, "minutes").asMilliseconds(),
  "1 hour": dayjs.duration(1, "hour").asMilliseconds(),
  "24 hours": dayjs.duration(24, "hours").asMilliseconds(),
  "7 days": dayjs.duration(7, "days").asMilliseconds(),
} as const satisfies Record<string, number>;

/* eslint-disable perfectionist/sort-objects */
import { dayjs } from "#shared/services/dayjs";

// Discord's invite expiry options; the "Never" (null) option lives in the select, not here
export const InviteExpireAfterMinutesMap = {
  "30 minutes": dayjs.duration(30, "minutes").asMinutes(),
  "1 hour": dayjs.duration(1, "hour").asMinutes(),
  "6 hours": dayjs.duration(6, "hours").asMinutes(),
  "12 hours": dayjs.duration(12, "hours").asMinutes(),
  "1 day": dayjs.duration(1, "day").asMinutes(),
  "7 days": dayjs.duration(7, "days").asMinutes(),
} as const satisfies Record<string, number>;

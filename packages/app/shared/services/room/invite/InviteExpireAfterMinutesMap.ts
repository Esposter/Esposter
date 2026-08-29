/* eslint-disable perfectionist/sort-objects */
import { DAY, HOUR, MINUTE } from "@esposter/shared";

// Discord's invite expiry options; the "Never" (the 0 sentinel) option lives in the select, not here
export const InviteExpireAfterMinutesMap = {
  "30 minutes": 30,
  "1 hour": HOUR / MINUTE,
  "6 hours": (6 * HOUR) / MINUTE,
  "12 hours": (12 * HOUR) / MINUTE,
  "1 day": DAY / MINUTE,
  "7 days": (7 * DAY) / MINUTE,
} as const satisfies Record<string, number>;

export const InviteExpireAfterMinutes = Object.values(InviteExpireAfterMinutesMap);

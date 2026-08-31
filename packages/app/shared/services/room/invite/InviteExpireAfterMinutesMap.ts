/* eslint-disable perfectionist/sort-objects */

// Discord's invite expiry options; the "Never" (the 0 sentinel) option lives in the select, not here
export const InviteExpireAfterMinutesMap = {
  "30 minutes": Temporal.Duration.from({ minutes: 30 }).total("minutes"),
  "1 hour": Temporal.Duration.from({ hours: 1 }).total("minutes"),
  "6 hours": Temporal.Duration.from({ hours: 6 }).total("minutes"),
  "12 hours": Temporal.Duration.from({ hours: 12 }).total("minutes"),
  "1 day": Temporal.Duration.from({ days: 1 }).total("minutes"),
  "7 days": Temporal.Duration.from({ days: 7 }).total("minutes"),
} as const satisfies Record<string, number>;

export const InviteExpireAfterMinutes = Object.values(InviteExpireAfterMinutesMap);

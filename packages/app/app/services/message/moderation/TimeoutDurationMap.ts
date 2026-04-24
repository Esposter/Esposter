/* eslint-disable perfectionist/sort-objects */
export const TimeoutDurationMap = {
  "1 minute": 60_000,
  "5 minutes": 300_000,
  "10 minutes": 600_000,
  "1 hour": 3_600_000,
  "24 hours": 86_400_000,
  "7 days": 604_800_000,
} as const satisfies Record<string, number>;

/* eslint-disable perfectionist/sort-objects */

export const TimeoutDurationMap = {
  "1 minute": Temporal.Duration.from({ minutes: 1 }).total("milliseconds"),
  "5 minutes": Temporal.Duration.from({ minutes: 5 }).total("milliseconds"),
  "10 minutes": Temporal.Duration.from({ minutes: 10 }).total("milliseconds"),
  "1 hour": Temporal.Duration.from({ hours: 1 }).total("milliseconds"),
  "24 hours": Temporal.Duration.from({ hours: 24 }).total("milliseconds"),
  "7 days": Temporal.Duration.from({ days: 7 }).total("milliseconds"),
} as const satisfies Record<string, number>;

import type { TimeZone } from "#shared/models/entity/TimeZone";

// Whether the current time in the time zone the trigger's call carried, the sender's own rather than the server's,
// Truncated to the reference unit, falls in the window of whole units counted from it
export const isWithinTime =
  ({
    maximum,
    minimum,
    referenceUnit,
    unit,
  }: {
    maximum: number;
    minimum: number;
    referenceUnit: "day" | Temporal.TimeUnit;
    unit: Temporal.DateUnit | Temporal.TimeUnit;
  }) =>
  ({ timeZone }: TimeZone): boolean => {
    const now = Temporal.Now.zonedDateTimeISO(timeZone);
    const value = Math.trunc(
      now.since(now.round({ roundingMode: "trunc", smallestUnit: referenceUnit })).total({ relativeTo: now, unit }),
    );
    return value >= minimum && value < maximum;
  };

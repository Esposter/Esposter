// Whether the current time, truncated to the reference unit, falls in the window of whole units counted from it
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
  (): boolean => {
    const now = Temporal.Now.zonedDateTimeISO();
    const value = Math.trunc(
      now.since(now.round({ roundingMode: "trunc", smallestUnit: referenceUnit })).total({ relativeTo: now, unit }),
    );
    return value >= minimum && value < maximum;
  };

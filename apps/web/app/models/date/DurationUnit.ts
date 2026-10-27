// Largest first, which is the order a duration is rounded to the first unit it fills
export enum DurationUnit {
  Day = "day",
  Hour = "hour",
  Minute = "minute",
  Second = "second",
}

export const DurationUnits = Object.values(DurationUnit);

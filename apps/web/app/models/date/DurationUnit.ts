// Largest first, which is the order a duration is rounded to the first unit it fills
export const DurationUnits = ["day", "hour", "minute", "second"] as const;

export type DurationUnit = (typeof DurationUnits)[number];

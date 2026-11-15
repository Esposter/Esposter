// Largest first, which is the order a duration is rounded to the first unit it fills
export const DurationUnit = { Day: "day", Hour: "hour", Minute: "minute", Second: "second" } as const;
export type DurationUnit = (typeof DurationUnit)[keyof typeof DurationUnit];

export const DurationUnits = Object.values(DurationUnit);

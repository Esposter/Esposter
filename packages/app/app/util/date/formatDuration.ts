const DURATION_UNITS = ["day", "hour", "minute", "second"] as const;

type DurationUnit = (typeof DURATION_UNITS)[number];
// Pinned to en-US rather than the reader's locale, like every other formatter here: a duration is rendered on
// Both sides of hydration, and a server that speaks a different locale would print different text to the one
// The browser then computes.
const createUnitFormatter = (unit: DurationUnit): Intl.NumberFormat =>
  new Intl.NumberFormat("en-US", { style: "unit", unit, unitDisplay: "long" });
const DurationUnitFormatterMap: Record<DurationUnit, Intl.NumberFormat> = {
  day: createUnitFormatter("day"),
  hour: createUnitFormatter("hour"),
  minute: createUnitFormatter("minute"),
  second: createUnitFormatter("second"),
};
// The largest unit the duration fills at least once, rounded to it — "3 hours", not "3 hours 12 minutes 4
// Seconds". A span nobody is going to act on to the second reads as a magnitude, which is the whole point of
// Printing it at all.
export const formatDuration = (ms: number): string => {
  const duration = Temporal.Duration.from({ milliseconds: Math.max(Math.round(ms), 0) });
  for (const unit of DURATION_UNITS) {
    const total = Math.round(duration.total(unit));
    if (total > 0) return DurationUnitFormatterMap[unit].format(total);
  }
  return DurationUnitFormatterMap.second.format(0);
};

import { DurationUnit, DurationUnits } from "@/models/date/DurationUnit";

import { createUnitFormatter } from "@/util/date/createUnitFormatter";

const DurationUnitFormatterMap: Record<DurationUnit, Intl.NumberFormat> = {
  [DurationUnit.Day]: createUnitFormatter(DurationUnit.Day),
  [DurationUnit.Hour]: createUnitFormatter(DurationUnit.Hour),
  [DurationUnit.Minute]: createUnitFormatter(DurationUnit.Minute),
  [DurationUnit.Second]: createUnitFormatter(DurationUnit.Second),
};
// The largest unit the duration fills at least once, rounded to it — "3 hours", not "3 hours 12 minutes 4
// Seconds". A span nobody is going to act on to the second reads as a magnitude, which is the whole point of
// Printing it at all.
export const formatDuration = (durationMs: number) => {
  const duration = Temporal.Duration.from({ milliseconds: Math.max(Math.round(durationMs), 0) });
  for (const unit of DurationUnits) {
    const total = Math.round(duration.total(unit));
    if (total > 0) return DurationUnitFormatterMap[unit].format(total);
  }
  return DurationUnitFormatterMap.second.format(0);
};

import type { DurationUnit } from "@/models/date/DurationUnit";

// Pinned to en-US rather than the reader's locale, like every other formatter here: a duration is rendered on
// Both sides of hydration, and a server that speaks a different locale would print different text to the one
// The browser then computes.
export const createUnitFormatter = (unit: DurationUnit) =>
  new Intl.NumberFormat("en-US", { style: "unit", unit, unitDisplay: "long" });

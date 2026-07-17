import type { Resource } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { RECYCLE_BIN_RETENTION_MS } from "@esposter/db";
import { pluralize } from "#shared/util/text/pluralize";

// The bin's whole point is the deadline, so the column says how long is left rather than a date.
// Anything already past its window is awaiting the next sweep, not staying forever.
export const getPurgesInText = (deletedAt: Resource["deletedAt"]): string => {
  if (!deletedAt) return "";

  const purgesAt = dayjs(deletedAt).add(RECYCLE_BIN_RETENTION_MS, "milliseconds");
  // Partial days round up — a purge 29.5 days away reads as 30, never as already closer than it is
  const remainingDays = Math.ceil(purgesAt.diff(dayjs()) / dayjs.duration(1, "day").asMilliseconds());
  if (remainingDays <= 0) return "Purges soon";
  return `Purges in ${remainingDays} ${pluralize("day", remainingDays)}`;
};

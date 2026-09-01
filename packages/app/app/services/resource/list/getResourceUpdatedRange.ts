import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { exhaustiveGuard, getEndOfDay, getZonedDateTime } from "@esposter/shared";

// Resolved at fetch time so relative presets stay anchored to "now" instead of a stale computed
export const getResourceUpdatedRange = (
  updatedFilter: "" | ResourceUpdatedFilter,
  updatedAfter?: Date,
  updatedBefore?: Date,
): { updatedAfter?: Date; updatedBefore?: Date } => {
  switch (updatedFilter) {
    case "":
      return {};
    case ResourceUpdatedFilter.Custom:
      return {
        ...(updatedAfter ? { updatedAfter } : {}),
        // Extend to end-of-day so the selected "To" date is inclusive against the server's lte filter
        ...(updatedBefore ? { updatedBefore: getEndOfDay(updatedBefore) } : {}),
      };
    // Subtracted as calendar days rather than fixed 24-hour spans, so a preset crossing a DST transition
    // Still lands on the same wall-clock time it started from
    case ResourceUpdatedFilter.Last7Days:
      return { updatedAfter: new Date(getZonedDateTime(new Date()).subtract({ days: 7 }).epochMilliseconds) };
    case ResourceUpdatedFilter.Last24Hours:
      return { updatedAfter: new Date(Date.now() - Temporal.Duration.from({ hours: 24 }).total("milliseconds")) };
    case ResourceUpdatedFilter.Last30Days:
      return { updatedAfter: new Date(getZonedDateTime(new Date()).subtract({ days: 30 }).epochMilliseconds) };
    default:
      return exhaustiveGuard(updatedFilter);
  }
};

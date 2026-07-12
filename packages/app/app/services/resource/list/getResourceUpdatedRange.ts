import { dayjs } from "#shared/services/dayjs";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { exhaustiveGuard } from "@esposter/shared";

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
      return { ...(updatedAfter ? { updatedAfter } : {}), ...(updatedBefore ? { updatedBefore } : {}) };
    case ResourceUpdatedFilter.Last7Days:
      return { updatedAfter: dayjs().subtract(7, "days").toDate() };
    case ResourceUpdatedFilter.Last24Hours:
      return { updatedAfter: dayjs().subtract(24, "hours").toDate() };
    case ResourceUpdatedFilter.Last30Days:
      return { updatedAfter: dayjs().subtract(30, "days").toDate() };
    default:
      return exhaustiveGuard(updatedFilter);
  }
};

export enum ResourceUpdatedFilter {
  Custom = "Custom",
  Last7Days = "Last 7 days",
  Last24Hours = "Last 24 hours",
  Last30Days = "Last 30 days",
}

export const ResourceUpdatedFilters = new Set(Object.values(ResourceUpdatedFilter));

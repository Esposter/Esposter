// Declared chronologically because Object.values drives the dropdown order
export enum ResourceUpdatedFilter {
  Last24Hours = "Last 24 hours",
  Last7Days = "Last 7 days",
  Last30Days = "Last 30 days",
  Custom = "Custom",
}

export const ResourceUpdatedFilters = new Set(Object.values(ResourceUpdatedFilter));

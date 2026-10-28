export enum ResourceUpdatedFilter {
  Custom = "Custom",
  Last24Hours = "Last 24 hours",
  Last30Days = "Last 30 days",
  Last7Days = "Last 7 days",
}

// The presets in the order the dropdown lists them, chronological with Custom last
const ResourceUpdatedFilterOrder: ResourceUpdatedFilter[] = [
  ResourceUpdatedFilter.Last24Hours,
  ResourceUpdatedFilter.Last7Days,
  ResourceUpdatedFilter.Last30Days,
  ResourceUpdatedFilter.Custom,
];
export const ResourceUpdatedFilters: ReadonlySet<ResourceUpdatedFilter> = new Set(ResourceUpdatedFilterOrder);

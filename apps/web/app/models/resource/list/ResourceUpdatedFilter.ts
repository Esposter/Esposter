export enum ResourceUpdatedFilter {
  Custom = "Custom",
  Last7Days = "Last 7 days",
  Last24Hours = "Last 24 hours",
  Last30Days = "Last 30 days",
}

// The presets in the order the dropdown lists them, chronological with Custom last
// Keyed by preset so a new one fails the typecheck until it names its place rather than being left out of the dropdown
const ResourceUpdatedFilterOrder: Record<ResourceUpdatedFilter, number> = {
  [ResourceUpdatedFilter.Custom]: 3,
  [ResourceUpdatedFilter.Last7Days]: 1,
  [ResourceUpdatedFilter.Last24Hours]: 0,
  [ResourceUpdatedFilter.Last30Days]: 2,
};
export const ResourceUpdatedFilters: ReadonlySet<ResourceUpdatedFilter> = new Set(
  Object.values(ResourceUpdatedFilter).toSorted(
    (firstFilter, secondFilter) => ResourceUpdatedFilterOrder[firstFilter] - ResourceUpdatedFilterOrder[secondFilter],
  ),
);

export enum ResourceStatusFilter {
  Draft = "Draft",
  Published = "Published",
}

export const ResourceStatusFilters: ReadonlySet<ResourceStatusFilter> = new Set(Object.values(ResourceStatusFilter));

export const ResourceStatusFilter = { Draft: "Draft", Published: "Published" } as const;
export type ResourceStatusFilter = (typeof ResourceStatusFilter)[keyof typeof ResourceStatusFilter];

export const ResourceStatusFilters: ReadonlySet<ResourceStatusFilter> = new Set(Object.values(ResourceStatusFilter));

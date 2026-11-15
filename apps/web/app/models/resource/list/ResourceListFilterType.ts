export const ResourceListFilterType = { Status: "Status", Tag: "Tag", Updated: "Updated" } as const;
export type ResourceListFilterType = (typeof ResourceListFilterType)[keyof typeof ResourceListFilterType];

export const ResourceListFilterTypes = Object.values(ResourceListFilterType);

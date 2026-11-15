export const ResourceHomeTab = { Favorites: "favorites", Recent: "recent" } as const;
export type ResourceHomeTab = (typeof ResourceHomeTab)[keyof typeof ResourceHomeTab];
// The route-query guard's membership check — Home's section writes its two tabs out literally, so nothing here
// Decides the order they render in
export const ResourceHomeTabs: ReadonlySet<ResourceHomeTab> = new Set(Object.values(ResourceHomeTab));

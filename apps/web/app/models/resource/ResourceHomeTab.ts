export enum ResourceHomeTab {
  Favorites = "favorites",
  Recent = "recent",
}
// The route-query guard's membership check — the card writes its two tabs out literally, so nothing here
// Decides the order they render in
export const ResourceHomeTabs: ReadonlySet<ResourceHomeTab> = new Set(Object.values(ResourceHomeTab));

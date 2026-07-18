/* eslint-disable perfectionist/sort-enums */
// Declaration order is the tab order, so the sort rule is disabled to keep Recent first.
export enum ResourceHomeTab {
  Recent = "recent",
  Favorites = "favorites",
}
// Set iteration preserves the declaration order, so the card renders Recent → Favorites.
export const ResourceHomeTabs: ReadonlySet<ResourceHomeTab> = new Set(Object.values(ResourceHomeTab));

// Which set of the caller's resources a list route is pointed at. Every entry renders the same workbench —
// The source is a filter preset and a default sort, never a second list implementation.
export const ResourceListSource = { All: "All", Favorites: "Favorites", Recents: "Recents" } as const;
export type ResourceListSource = (typeof ResourceListSource)[keyof typeof ResourceListSource];

export const ResourceListSources = Object.values(ResourceListSource);

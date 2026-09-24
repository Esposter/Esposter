import { ResourceListSource } from "@/models/resource/list/ResourceListSource";

// The list routes' titles as a flat search result carries them. Spelled out here rather than taken from the
// Definition: the menu sits under a "Resources" heading that supplies the noun, while a search result or a palette
// Group has to carry it — "Favorites" alone is ambiguous
export const ResourceListSourceSearchTitleMap = {
  [ResourceListSource.All]: "All resources",
  [ResourceListSource.Favorites]: "Favorite resources",
  [ResourceListSource.Recents]: "Recent resources",
} as const satisfies Record<ResourceListSource, string>;

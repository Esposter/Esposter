import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { ResourceHomeTab } from "@/models/resource/ResourceHomeTab";

// Home's tabs and the service menu's list routes are the same two sets seen at two sizes, so the card reads
// Its icon and empty-state copy from the source definition rather than restating them
export const ResourceHomeTabSourceMap: Record<ResourceHomeTab, ResourceListSource> = {
  [ResourceHomeTab.Favorites]: ResourceListSource.Favorites,
  [ResourceHomeTab.Recent]: ResourceListSource.Recents,
};

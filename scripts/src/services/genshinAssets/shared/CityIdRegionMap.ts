import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// The game's city ids a pool or a daily task is filed under, each mapped to the region the map's areas and the world's
// Catalogue name. Nod-Krai's city is in no region, so its points draw from no stock and its tasks are left out
export const CityIdRegionMap: Record<number, string> = {
  1: DerivedAssetComponent.Mondstadt,
  2: DerivedAssetComponent.Liyue,
  3: DerivedAssetComponent.Inazuma,
  4: DerivedAssetComponent.Sumeru,
  5: DerivedAssetComponent.Fontaine,
  6: DerivedAssetComponent.Natlan,
  7: DerivedAssetComponent.Snezhnaya,
};

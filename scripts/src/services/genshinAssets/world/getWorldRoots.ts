import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { DerivedAssetComponentOptions } from "#src/models/genshinAssets/shared/DerivedAssetComponentOptions";

// The prefabs a part of the open world sets down, at its scene points and in its streams, which are its roots as much
// As the ones its map names
export const getWorldRoots = ({ world }: DerivedAssetComponentOptions): AssetRoot[] => [
  ...(world?.points ?? []).map(({ prefab }) => prefab),
  ...(world?.streams ?? []).flatMap(({ prefabs }) => prefabs.map(({ prefab }) => prefab)),
];

import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { composeAssetPlacements } from "#src/services/genshinAssets/composeAssetPlacements";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readSceneLayout } from "#src/services/genshinAssets/readSceneLayout";

// Where every object of a component's blocks stands, composed from their layout dumps, kept to the arrangements hanging
// From the roots its map names: one set of meshes is laid out several times across a scene's blocks, and only some of
// Those arrangements are the component's. A root whose parent was lost with a block not read hangs from the parent its
// Map names, which moves and scales it as Unity composes a Transform.
// Other roots can be named in their place, to try another arrangement
export const readComponentPlacements = async (
  component: DerivedAssetComponent,
  roots: readonly string[] = DerivedAssetComponentMap[component].roots,
): Promise<AssetPlacement[]> => {
  const { nameDrawingMap, objects } = await readSceneLayout(getComponentDirectory(component).layout);
  const { rootParents = {} } = DerivedAssetComponentMap[component];
  const placements = composeAssetPlacements(objects, nameDrawingMap).filter(({ root }) => roots.includes(root));
  for (const placement of placements) {
    const parent = rootParents[placement.root];
    if (!parent) continue;
    const {
      position: [x, y, z],
      scale,
    } = parent;
    const [px, py, pz] = placement.position;
    const [sx, sy, sz] = placement.scale;
    placement.position = [x + px * scale, y + py * scale, z + pz * scale];
    placement.scale = [sx * scale, sy * scale, sz * scale];
  }
  return placements;
};

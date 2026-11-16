import type { HullPlacement } from "#src/models/genshinAssets/fit/HullPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { fitMeshHulls } from "#src/services/genshinAssets/fit/fitMeshHulls";
import { readWitnessPlacements } from "#src/services/genshinAssets/fit/readWitnessPlacements";
import { toHullPlacements } from "#src/services/genshinAssets/fit/toHullPlacements";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { join } from "node:path";

// A component's hulls of the meshes the check keeps: each mesh's visual hull fitted off its own export (`fitVisualHull` at
// `HULL_CELL_SIZE`, in three's axes), and each place the witness stands it. No game vertex is kept
export const fitRegionHulls = async (
  component: DerivedAssetComponent,
  checkIsHullMesh: (mesh: string) => boolean,
): Promise<{ hulls: Record<string, number[][]>; placements: HullPlacement[] }> => {
  const { assets } = getComponentDirectory(component);
  const placements = toHullPlacements(await readWitnessPlacements(component), checkIsHullMesh);
  const meshes = [...new Set(placements.map(({ hull }) => hull))];
  const hulls = await fitMeshHulls(
    new Map(meshes.map((mesh) => [mesh, join(assets, AssetType.Mesh, `${mesh}.obj`)] as const)),
  );
  return { hulls, placements };
};

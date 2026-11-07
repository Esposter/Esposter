import type { HullPlacement } from "#src/models/genshinAssets/fit/HullPlacement";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { SceneLayout } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { fitMeshHulls } from "#src/services/genshinAssets/fit/fitMeshHulls";
import { readWitnessPlacements } from "#src/services/genshinAssets/fit/readWitnessPlacements";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { roundRotation } from "#src/services/genshinAssets/fit/roundRotation";
import { SCALE_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { GameDataset } from "genshin-world";
import { join } from "node:path";

// The witness placements whose mesh the check keeps, each the hull of that mesh placed where the witness draws it: the
// Layout is already in three's axes round the origin, so nothing is turned or moved again
export const toHullPlacements = (
  placements: SceneLayout["placements"],
  checkIsHullMesh: (mesh: string) => boolean,
): HullPlacement[] =>
  placements
    .filter(({ mesh }) => checkIsHullMesh(mesh))
    .map(({ mesh, position, rotation, scale }) => {
      const [x = 0, y = 0, z = 0] = position.map((value) => roundFitted(value));
      return {
        hull: mesh,
        position: [x, y, z],
        rotation: rotation.map((value) => roundRotation(value)),
        scale: scale.map((value) => roundFitted(value, SCALE_DECIMALS)),
      };
    });

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

// A region's hulls fit for one kind of object, published as the region's own record, `regions/<region>/<kind>`, which
// Names the kind in its note too
export const createRegionHullsFit =
  (region: DerivedAssetComponent, kind: string, checkIsHullMesh: (mesh: string) => boolean) =>
  async (): Promise<GameDataBuild> => {
    const { hulls, placements } = await fitRegionHulls(region, checkIsHullMesh);
    const boxes = Object.values(hulls).reduce((sum, hull) => sum + hull.length, 0);
    return {
      notes: [`${region} ${kind}: ${Object.keys(hulls).length} hulls, ${boxes} boxes, ${placements.length} places`],
      objects: { [`${GameDataset.Regions}/${region}/${kind}`]: { hulls, placements } },
    };
  };

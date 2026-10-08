import type { PavingPlacement } from "#src/models/genshinAssets/fit/PavingPlacement";
import type { PavingStoneShape } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitPavingStoneShape } from "#src/services/genshinAssets/fit/fitPavingStoneShape";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS, SCALE_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { join } from "node:path";

// The slabs round Windrise's statue, the two stones the export's tiles place under the dais steps and their
// Placements across the valley (`DerivedAssetComponentMap`)
const PAVING_MESH_REGEX = /^Area_Common_Build_Ruin_H_0[67]_Vo$/u;
// The paving stones of Windrise as their outlines and where each stands, in three's axes round the oak's foot: each
// Mesh's outline fitted once and every placement of it written beside it, so the world draws them as generated stones
export const fitWindrisePaving = async (): Promise<{
  placements: PavingPlacement[];
  shapes: Record<string, PavingStoneShape>;
}> => {
  const [placements, [originX, originY, originZ]] = await Promise.all([
    readComponentPlacements(DerivedAssetComponent.Windrise, { isCopied: true }),
    readWorldOrigin(DerivedAssetComponent.Windrise),
  ]);
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  const stones = placements.filter(({ mesh }) => PAVING_MESH_REGEX.test(mesh));
  const shapes: Record<string, PavingStoneShape> = {};
  for (const mesh of new Set(stones.map((stone) => stone.mesh))) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const { vertices } = await readObjMesh(join(meshDirectory, `${mesh}.obj`));
    shapes[mesh] = fitPavingStoneShape(vertices.map((vertex) => toRightHanded(vertex)));
  }
  return {
    placements: stones.map(({ mesh, position, rotation, scale }) => ({
      mesh,
      position: toRightHanded([position[0] - originX, position[1] - originY, position[2] - originZ]).map((value) =>
        roundFitted(value),
      ),
      rotation: toRightHandedRotation(rotation).map(
        (value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS,
      ),
      scale: scale.map((value) => roundFitted(value, SCALE_DECIMALS)),
    })),
    shapes,
  };
};

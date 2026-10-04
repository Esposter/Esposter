import type { HullPlacement } from "#src/models/genshinAssets/fit/HullPlacement";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { fitVisualHull } from "#src/services/genshinAssets/fit/fitVisualHull";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/fit/readLevelOfDetailParts";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { HULL_CELL_SIZE, ROTATION_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { ID_SEPARATOR } from "@esposter/shared";

// A bridge's or a pillar's mesh at one level of detail, the part being its name without the level
const HULL_MESH_REGEX = /^(?<part>LoginScene_(?:Bridge0[234]|Pillar03)(?:_\d+)?)_Lod(?<level>\d)$/u;
// The login scene's bridges and pillars as hulls: each part's visual hull from its most detailed mesh, boxes in three's
// Axes about its own origin, so the arches and the space under the decks the camera glides through stay open, and one
// Instance wherever any level of detail of it stands, with its rotation turned into three's axes too
export const fitLoginHulls = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ hulls: Record<string, number[][]>; placements: HullPlacement[] }> => {
  const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, HULL_MESH_REGEX, meshDirectory);
  const hulls: Record<string, number[][]> = {};
  for (const [part, meshPath] of meshPathMap) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const { faces, vertices } = await readObjMesh(meshPath);
    const local = vertices.map((vertex) => toRightHanded(vertex));
    hulls[part] = fitVisualHull({ faces, vertices: local }, HULL_CELL_SIZE).map((box) =>
      box.map((value) => roundFitted(value)),
    );
  }
  const keyInstanceMap = new Map<string, HullPlacement>();
  for (const { part, position, rotation, scale } of partPlacements) {
    if (!hulls[part]) continue;
    const [x = 0, y = 0, z = 0] = toRightHanded(position).map((value) => roundFitted(value));
    keyInstanceMap.set(`${part}${ID_SEPARATOR}${x},${y},${z}`, {
      hull: part,
      position: [x, y, z],
      rotation: toRightHandedRotation(rotation).map(
        (value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS,
      ),
      scale: scale.map((value) => roundFitted(value)),
    });
  }
  return { hulls, placements: [...keyInstanceMap.values()] };
};

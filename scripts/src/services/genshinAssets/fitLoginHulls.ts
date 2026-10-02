import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { HULL_CELL_SIZE, ROTATION_DECIMALS } from "#src/services/genshinAssets/constants";
import { fitVisualHull } from "#src/services/genshinAssets/fitVisualHull";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/readLevelOfDetailParts";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/toRightHandedRotation";

// A bridge's or a pillar's mesh at one level of detail, the part being its name without the level
const HULL_MESH_REGEX = /^(?<part>LoginScene_(?:Bridge0[234]|Pillar03)(?:_\d+)?)_Lod(?<level>\d)$/u;
// The login scene's bridges and pillars as hulls: each part's visual hull from its most detailed mesh, boxes in three's
// Axes about its own origin, so the arches and the space under the decks the camera glides through stay open, and one
// Instance wherever any level of detail of it stands, with its rotation turned into three's axes too
export const fitLoginHulls = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{
  hulls: Record<string, number[][]>;
  placements: { hull: string; position: [number, number, number]; rotation: number[]; scale: number[] }[];
}> => {
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
  const instances = new Map<
    string,
    { hull: string; position: [number, number, number]; rotation: number[]; scale: number[] }
  >();
  for (const { part, position, rotation, scale } of partPlacements) {
    if (!hulls[part]) continue;
    const [x = 0, y = 0, z = 0] = toRightHanded(position).map((value) => roundFitted(value));
    instances.set(`${part}|${x},${y},${z}`, {
      hull: part,
      position: [x, y, z],
      rotation: toRightHandedRotation(rotation).map(
        (value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS,
      ),
      scale: scale.map((value) => roundFitted(value)),
    });
  }
  return { hulls, placements: [...instances.values()] };
};

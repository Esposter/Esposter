import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { SILHOUETTE_CELL_SIZE, SILHOUETTE_TOLERANCE } from "#src/services/genshinAssets/constants";
import { fitSilhouette } from "#src/services/genshinAssets/fitSilhouette";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/readLevelOfDetailParts";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/toRightHandedRotation";

interface Silhouette {
  contours: [number, number][][];
  // Where the silhouette's slab starts and ends through its depth, along its own z
  depth: [number, number];
}
type Triangle = [[number, number], [number, number], [number, number]];
// A rotation's components are kept to the ten-thousandth, finer than a centimetre over the scene's farthest part
const ROTATION_DECIMALS = 10_000;
// A bridge's or a pillar's mesh at one level of detail, the part being its name without the level
const SILHOUETTE_MESH_REGEX = /^(?<part>LoginScene_(?:Bridge0[234]|Pillar03)(?:_\d+)?)_Lod(?<level>\d)$/u;
// The login scene's bridges and pillars, each a slab whose shape is its side, as silhouettes: each part's outline and
// Arches from its most detailed mesh, in three's axes about its own origin, and one instance wherever any level of
// Detail of it stands, with its rotation turned into three's axes too
export const fitLoginSilhouettes = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{
  placements: { position: [number, number, number]; rotation: number[]; scale: number[]; silhouette: string }[];
  silhouettes: Record<string, Silhouette>;
}> => {
  const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, SILHOUETTE_MESH_REGEX, meshDirectory);
  const silhouettes: Record<string, Silhouette> = {};
  for (const [part, meshPath] of meshPathMap) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const { faces, vertices } = await readObjMesh(meshPath);
    const local = vertices.map((vertex) => toRightHanded(vertex));
    const triangles = faces.flatMap(([first, second, third]): Triangle[] => {
      const [a, b, c] = [local[first], local[second], local[third]];
      return a && b && c
        ? [
            [
              [a[0], a[1]],
              [b[0], b[1]],
              [c[0], c[1]],
            ],
          ]
        : [];
    });
    const zs = local.map((vertex) => vertex[2]);
    silhouettes[part] = {
      contours: fitSilhouette(triangles, { cellSize: SILHOUETTE_CELL_SIZE, tolerance: SILHOUETTE_TOLERANCE }).map(
        (contour) => contour.map(([x, y]): [number, number] => [roundFitted(x), roundFitted(y)]),
      ),
      depth: [roundFitted(Math.min(...zs)), roundFitted(Math.max(...zs))],
    };
  }
  const instances = new Map<
    string,
    { position: [number, number, number]; rotation: number[]; scale: number[]; silhouette: string }
  >();
  for (const { part, position, rotation, scale } of partPlacements) {
    if (!silhouettes[part]) continue;
    const [x = 0, y = 0, z = 0] = toRightHanded(position).map((value) => roundFitted(value));
    instances.set(`${part}|${x},${y},${z}`, {
      position: [x, y, z],
      rotation: toRightHandedRotation(rotation).map(
        (value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS,
      ),
      scale: scale.map((value) => roundFitted(value)),
      silhouette: part,
    });
  }
  return { placements: [...instances.values()], silhouettes };
};

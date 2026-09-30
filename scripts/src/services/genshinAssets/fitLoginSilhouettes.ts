import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { SILHOUETTE_CELL_SIZE, SILHOUETTE_TOLERANCE } from "#src/services/genshinAssets/constants";
import { fitSilhouette } from "#src/services/genshinAssets/fitSilhouette";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { existsSync } from "node:fs";
import { join } from "node:path";

interface Silhouette {
  contours: [number, number][][];
  // Where the silhouette's slab starts and ends through its depth, along its own z
  depth: [number, number];
}
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
  const partPlacements = placements.flatMap((placement) => {
    const part = SILHOUETTE_MESH_REGEX.exec(placement.mesh)?.groups?.part;
    return part ? [{ ...placement, part }] : [];
  });
  const silhouettes: Record<string, Silhouette> = {};
  for (const part of new Set(partPlacements.map((placement) => placement.part)).values().toArray().toSorted()) {
    const meshPath = [0, 1, 2]
      .map((level) => join(meshDirectory, `${part}_Lod${level}.obj`))
      .find((path) => existsSync(path));
    if (!meshPath) continue;
    // oxlint-disable-next-line no-await-in-loop -- one mesh is read at a time
    const { faces, vertices } = await readObjMesh(meshPath);
    const local = vertices.map((vertex) => toRightHanded(vertex));
    const triangles = faces.flatMap(([first, second, third]) => {
      const [a, b, c] = [local[first], local[second], local[third]];
      return a && b && c
        ? [
            [
              [a[0], a[1]],
              [b[0], b[1]],
              [c[0], c[1]],
            ] as [[number, number], [number, number], [number, number]],
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
    const [x, y, z] = toRightHanded(position).map((value) => roundFitted(value));
    const [rotationX, rotationY, rotationZ, rotationW] = rotation;
    instances.set(`${part}|${x},${y},${z}`, {
      position: [x ?? 0, y ?? 0, z ?? 0],
      // A rotation mirrored across z turns the other way about x and y
      rotation: [-rotationX, -rotationY, rotationZ, rotationW].map((value) => Math.round(value * 10_000) / 10_000),
      scale: scale.map((value) => roundFitted(value)),
      silhouette: part,
    });
  }
  return { placements: [...instances.values()], silhouettes };
};

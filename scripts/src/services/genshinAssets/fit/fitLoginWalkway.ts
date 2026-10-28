import type { LoginWalkwayPiece } from "#src/models/genshinAssets/fit/LoginWalkwayPiece";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { fitWalkwayPiece } from "#src/services/genshinAssets/fit/fitWalkwayPiece";
import { WALKWAY_MESH_REGEX } from "#src/services/genshinAssets/shared/constants";
import { settleAll } from "@esposter/shared";

// Pieces read a pool at a time, so every walkway placement's mesh is never held in memory at once
const WALKWAY_READ_CONCURRENCY = 4;
// The walkway as the slabs it is laid from, each piece's outline seen from above and the height its stone stands at,
// The one most of its tops stand at seen from above, and what stands raised over that stone, its curbs and its lanes'
// Borders a centimetre or three high, each traced from above as loops at its own height. Every piece rises into place
// On its own as the walkway assembles itself ahead of the camera; and
// The surface's and underside's heights, the levels most of its vertices lie at at its top and its foot
export const fitLoginWalkway = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ bottom: number; pieces: LoginWalkwayPiece[]; top: number }> => {
  const fitted = await settleAll(
    placements
      .filter(({ mesh }) => WALKWAY_MESH_REGEX.test(mesh))
      .toSorted((firstPlacement, secondPlacement) => firstPlacement.mesh.localeCompare(secondPlacement.mesh))
      .map((placement) => () => fitWalkwayPiece(placement, meshDirectory)),
    WALKWAY_READ_CONCURRENCY,
  );
  const heightCountMap = new Map<number, number>();
  const pieces: LoginWalkwayPiece[] = [];
  for (const { heightCounts, piece } of fitted) {
    pieces.push(piece);
    for (const [height, count] of heightCounts) heightCountMap.set(height, (heightCountMap.get(height) ?? 0) + count);
  }
  // The two most common heights, the surface above the underside
  const [first = 0, second = 0] = [...heightCountMap.entries()]
    .toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .map(([y]) => y);
  return { bottom: Math.min(first, second), pieces, top: Math.max(first, second) };
};

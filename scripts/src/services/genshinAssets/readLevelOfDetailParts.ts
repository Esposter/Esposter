import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { existsSync } from "node:fs";
import { join } from "node:path";

// Every placement drawing one level of detail of a part, a mesh named `<part>_Lod<level>` by the pattern's `part` and
// `level` groups, tagged with its part, and each part's most detailed mesh the export holds: a scene places a part's
// Levels together, and the finest of them is what its shape is fitted from
export const readLevelOfDetailParts = (
  placements: readonly AssetPlacement[],
  meshRegex: RegExp,
  meshDirectory: string,
): { meshPathMap: Map<string, string>; partPlacements: (AssetPlacement & { part: string })[] } => {
  const partPlacements = placements.flatMap((placement) => {
    const part = meshRegex.exec(placement.mesh)?.groups?.part;
    return part ? [{ ...placement, part }] : [];
  });
  const meshPathMap = new Map<string, string>();
  for (const part of new Set(partPlacements.map((placement) => placement.part)).values().toArray().toSorted()) {
    const levels = partPlacements
      .filter((placement) => placement.part === part)
      .map(({ mesh }) => Number(meshRegex.exec(mesh)?.groups?.level));
    const meshPath = [...new Set(levels)]
      .toSorted((firstLevel, secondLevel) => firstLevel - secondLevel)
      .map((level) => join(meshDirectory, `${part}_Lod${level}.obj`))
      .find((path) => existsSync(path));
    if (meshPath) meshPathMap.set(part, meshPath);
  }
  return { meshPathMap, partPlacements };
};

import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeCrossRatio } from "#src/services/genshinAssets/scene/computeCrossRatio";
import { DerivedAssetArrangementMap } from "#src/services/genshinAssets/scene/DerivedAssetArrangementMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentClips } from "#src/services/genshinAssets/shared/readComponentClips";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { join } from "node:path";

// A component's arrangement checked with no pixels: each ratio's cross-ratio as its reference measures it beside the
// Fitted data's, and each family's fitted instances against the exports' objects it stands for, composed as the family
// Stands them, as the distance from each instance to the nearest of them in metres, its mean and its largest; and the
// Offsets across and up the game's own data explains for each family of the witness
export const checkArrangement = async (
  component: DerivedAssetComponent,
): Promise<{
  explainedOffsets: Record<string, [number, number]>;
  families: { count: number; largest: number; mean: number; name: string }[];
  ratios: { fitted: number; measured: number; name: string; reference: string }[];
}> => {
  const { explainedOffsets, families, ratios } = DerivedAssetArrangementMap[component];
  const [placements, clips] = await Promise.all([readComponentPlacements(component), readComponentClips(component)]);
  const meshDirectory = join(getComponentDirectory(component).assets, AssetType.Mesh);
  return {
    explainedOffsets: Object.fromEntries(
      Object.entries(explainedOffsets).map(([family, readOffset]) => [family, readOffset(placements, clips)]),
    ),
    families: await Promise.all(
      families.map(async ({ name, readExpected, readPositions }) => {
        const [targets, positions] = await Promise.all([readExpected(placements, meshDirectory), readPositions()]);
        const distances = positions.map((position) =>
          Math.min(
            ...targets.map((target) => Math.hypot(...target.map((value, index) => value - (position[index] ?? 0)))),
          ),
        );
        return {
          count: distances.length,
          largest: Math.max(...distances),
          mean: distances.reduce((sum, distance) => sum + distance, 0) / distances.length,
          name,
        };
      }),
    ),
    ratios: await Promise.all(
      Object.entries(ratios).map(async ([name, { ends, readEnds, reference }]) => ({
        fitted: computeCrossRatio(await readEnds()),
        measured: computeCrossRatio(ends),
        name,
        reference,
      })),
    ),
  };
};

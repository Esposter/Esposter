import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { computeCrossRatio } from "#src/services/genshinAssets/scene/computeCrossRatio";
import { DerivedAssetArrangementMap } from "#src/services/genshinAssets/scene/DerivedAssetArrangementMap";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";

// A component's arrangement checked with no pixels: each ratio's cross-ratio as its reference measures it beside the
// Fitted data's, and each family's fitted instances against the exports' objects it stands for, as the distance from
// Each instance to the nearest of them in metres, its mean and its largest
export const checkArrangement = async (
  component: DerivedAssetComponent,
): Promise<{
  families: { count: number; largest: number; mean: number; name: string }[];
  ratios: { fitted: number; measured: number; name: string; reference: string }[];
}> => {
  const { families, ratios } = DerivedAssetArrangementMap[component];
  const placements = await readComponentPlacements(component);
  return {
    families: await Promise.all(
      families.map(async ({ name, nameRegex, readPositions }) => {
        const targets = placements
          .filter((placement) => nameRegex.test(placement.name))
          .map(({ position }) => toRightHanded(position));
        const distances = (await readPositions()).map((position) =>
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

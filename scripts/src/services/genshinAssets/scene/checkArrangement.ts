import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Vector } from "#src/models/shared/Vector";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeCrossRatio } from "#src/services/genshinAssets/scene/computeCrossRatio";
import { DerivedAssetArrangementMap } from "#src/services/genshinAssets/scene/DerivedAssetArrangementMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentClips } from "#src/services/genshinAssets/shared/readComponentClips";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { join } from "node:path";

// A component's arrangement checked with no pixels: each ratio's cross-ratio as its reference measures it beside the
// Fitted data's, and each family's fitted instances against the exports' objects it stands for, composed as the family
// Stands them, each instance beside the nearest of them, with its distance in metres, their mean and their largest;
// And the offsets across and up the game's own data explains for each family of the witness
export const checkArrangement = async (
  component: DerivedAssetComponent,
): Promise<{
  explainedOffsets: Record<string, [number, number]>;
  families: {
    largest: number;
    mean: number;
    name: string;
    pairs: { distance: number; expected: Vector; fitted: Vector }[];
  }[];
  ratios: { fitted: number; measured: number; name: string; reference: string }[];
}> => {
  const { explainedOffsets, families, ratios } = DerivedAssetArrangementMap[component];
  // A component no offset explains, as Windrise, decodes no clips
  const [placements, clips] = await Promise.all([
    readComponentPlacements(component),
    Object.keys(explainedOffsets).length > 0 ? readComponentClips(component) : [],
  ]);
  const meshDirectory = join(getComponentDirectory(component).assets, AssetType.Mesh);
  return {
    explainedOffsets: Object.fromEntries(
      Object.entries(explainedOffsets).map(([family, readOffset]) => [family, readOffset(placements, clips)]),
    ),
    families: await Promise.all(
      families.map(async ({ name, readExpected, readPositions }) => {
        const [targets, positions] = await Promise.all([readExpected(placements, meshDirectory), readPositions()]);
        const pairs = positions.map((fitted) =>
          targets
            .map((expected) => ({
              distance: Math.hypot(...expected.map((value, index) => value - (fitted[index] ?? 0))),
              expected,
              fitted,
            }))
            .reduce((nearest, pair) => (pair.distance < nearest.distance ? pair : nearest), {
              distance: Infinity,
              expected: fitted,
              fitted,
            }),
        );
        return {
          largest: Math.max(...pairs.map(({ distance }) => distance)),
          mean: pairs.reduce((sum, { distance }) => sum + distance, 0) / pairs.length,
          name,
          pairs,
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

import type { SimilarityTermMap } from "#src/models/genshinParity/witness/SimilarityTermMap";
import type { Vector } from "#src/models/shared/Vector";

import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";
import { readTargetLightness } from "#src/services/genshinParity/passes/readTargetLightness";
import { scoreLabelSimilarity } from "#src/services/genshinParity/witness/scoreLabelSimilarity";
import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";

const readColour = (albedo: Float32Array, pixel: number): Vector => [
  albedo[pixel * 4] ?? 0,
  albedo[pixel * 4 + 1] ?? 0,
  albedo[pixel * 4 + 2] ?? 0,
];
const addColours = (
  [firstRed, firstGreen, firstBlue]: Vector,
  [secondRed, secondGreen, secondBlue]: Vector,
): Vector => [firstRed + secondRed, firstGreen + secondGreen, firstBlue + secondBlue];
// Each family's unlit colour, ours against the exports', from the part and albedo targets the witness drew of each at
// One view, four floats a pixel, over the pixels both draw it: the CIELab distance between their mean colours, and how
// Unlike their lightness is in structure (`scoreLabelSimilarity`, 0 alike and 1 nothing alike), which a painted detail
// Off its place or missing reads where a mean does not. A family the exports draw nowhere is left out, and one ours
// Draws nowhere they do has no colour to read, so it stands at Infinity. The structure's terms come back pixel by
// Pixel too, scale by scale, for where on the frame it is lost
export const compareFamilyAlbedo = (
  exportsTargets: { albedo: Float32Array; part: Float32Array },
  oursTargets: { albedo: Float32Array; part: Float32Array },
  width: number,
  familyCount: number,
): {
  comparisons: { colour: number; family: number; scales: number[]; structure: number }[];
  termMaps: SimilarityTermMap[];
} => {
  const pixelCount = exportsTargets.part.length / 4;
  const height = pixelCount / width;
  const labels = Int32Array.from({ length: pixelCount }, (_label, pixel) => {
    const family = readTargetFamily(exportsTargets.part, pixel);
    return family === readTargetFamily(oursTargets.part, pixel) ? family : -1;
  });
  const { labelSimilarities, termMaps } = scoreLabelSimilarity(
    readTargetLightness(exportsTargets.albedo),
    readTargetLightness(oursTargets.albedo),
    width,
    height,
    labels,
    familyCount,
  );
  const comparisons = Array.from({ length: familyCount }, (_family, family) => family).flatMap((family) => {
    let isDrawn = false;
    let shared = 0;
    let exportsSum: Vector = [0, 0, 0];
    let oursSum: Vector = [0, 0, 0];
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      if (readTargetFamily(exportsTargets.part, pixel) === family) isDrawn = true;
      if (labels[pixel] !== family) continue;
      shared++;
      exportsSum = addColours(exportsSum, readColour(exportsTargets.albedo, pixel));
      oursSum = addColours(oursSum, readColour(oursTargets.albedo, pixel));
    }
    if (!isDrawn) return [];
    if (shared === 0) return [{ colour: Infinity, family, scales: [], structure: Infinity }];
    const toMeanLab = ([red, green, blue]: Vector): Vector =>
      toLab(toXyz([red / shared, green / shared, blue / shared]));
    const [exportsLightness, exportsA, exportsB] = toMeanLab(exportsSum);
    const [oursLightness, oursA, oursB] = toMeanLab(oursSum);
    return [
      {
        colour: Math.hypot(exportsLightness - oursLightness, exportsA - oursA, exportsB - oursB),
        family,
        scales: labelSimilarities[family]?.scales ?? [],
        structure: 1 - (labelSimilarities[family]?.similarity ?? 0),
      },
    ];
  });
  return { comparisons, termMaps };
};

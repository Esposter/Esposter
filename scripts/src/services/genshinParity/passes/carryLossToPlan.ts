import type { SimilarityTermMap } from "#src/models/genshinParity/witness/SimilarityTermMap";

import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// A length along a plan wrapped into its rectangle, as the plan repeats past it
const wrap = (value: number, length: number): number => ((value % length) + length) % length;
// Where on a family's plan its surface's structure is lost: each pixel the family draws where the exports' does too, its
// Loss (one less its term at each scale `scoreLabelSimilarity` reads, each scale's cell under the pixel, averaged over
// The scales that read it) carried to the place on our part's own geometry it shows (the position target) along the
// Plan's two axes, and summed in cells of the plan's resolution beside the pixels each cell gathers. A place outside
// The plan's rectangle is wrapped into it, as a plan repeats past its rectangle; columns run along the first axis and
// Rows along the second
export const carryLossToPlan = (
  termMaps: readonly SimilarityTermMap[],
  { part, position }: { part: Float32Array; position: Float32Array },
  {
    axes: [firstAxis, secondAxis],
    corner: [cornerFirst, cornerSecond],
    family,
    pixelsPerMetre,
    size: [sizeFirst, sizeSecond],
    width,
  }: {
    axes: readonly [number, number];
    corner: readonly [number, number];
    family: number;
    pixelsPerMetre: number;
    size: readonly [number, number];
    width: number;
  },
): { counts: Float32Array; height: number; losses: Float32Array; width: number } => {
  const planWidth = Math.max(Math.round(sizeFirst * pixelsPerMetre), 1);
  const planHeight = Math.max(Math.round(sizeSecond * pixelsPerMetre), 1);
  const losses = new Float32Array(planWidth * planHeight);
  const counts = new Float32Array(planWidth * planHeight);
  for (let pixel = 0; pixel < part.length / 4; pixel++) {
    if (readTargetFamily(part, pixel) !== family) continue;
    const [column, row] = [pixel % width, Math.floor(pixel / width)];
    let [lost, scaleCount] = [0, 0];
    for (const [scale, { height: levelHeight, terms, width: levelWidth }] of termMaps.entries()) {
      const levelColumn = Math.min(Math.floor(column / 2 ** scale), levelWidth - 1);
      const levelRow = Math.min(Math.floor(row / 2 ** scale), levelHeight - 1);
      const term = terms[levelRow * levelWidth + levelColumn] ?? Number.NaN;
      if (Number.isNaN(term)) continue;
      lost += 1 - term;
      scaleCount++;
    }
    if (scaleCount === 0) continue;
    const planColumn = Math.min(
      Math.floor(wrap((position[pixel * 4 + firstAxis] ?? 0) - cornerFirst, sizeFirst) * pixelsPerMetre),
      planWidth - 1,
    );
    const planRow = Math.min(
      Math.floor(wrap((position[pixel * 4 + secondAxis] ?? 0) - cornerSecond, sizeSecond) * pixelsPerMetre),
      planHeight - 1,
    );
    const cell = planRow * planWidth + planColumn;
    losses[cell] = (losses[cell] ?? 0) + lost / scaleCount;
    counts[cell] = (counts[cell] ?? 0) + 1;
  }
  return { counts, height: planHeight, losses, width: planWidth };
};

import type { Vector } from "#src/models/shared/Vector";

import { closeFamilyMask } from "#src/services/genshinParity/passes/closeFamilyMask";
import { computeBoxSums } from "#src/services/genshinParity/passes/computeBoxSums";
import { readFamilyMask } from "#src/services/genshinParity/passes/readFamilyMask";

// A family's envelope at a radius: its pixels closed, its depth averaged over the family within the radius, and its
// Normals averaged there and normalised, so a scattered family reads as the mass its cards make
export interface FamilyEnvelope {
  depth: Float64Array;
  mask: Uint8Array;
  normal: Float64Array;
}
export const computeFamilyEnvelope = (
  targets: { depth: Float32Array; normal: Float32Array; part: Float32Array },
  family: number,
  width: number,
  height: number,
  radius: number,
): FamilyEnvelope => {
  const pixelCount = width * height;
  const mask = readFamilyMask(targets.part, family, pixelCount);
  const depthValues = new Float32Array(pixelCount);
  const normalValues = [
    new Float32Array(pixelCount),
    new Float32Array(pixelCount),
    new Float32Array(pixelCount),
  ] as const;
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    if (mask[pixel] !== 1) continue;
    depthValues[pixel] = targets.depth[pixel * 4] ?? 0;
    for (const axis of [0, 1, 2] as const) normalValues[axis][pixel] = targets.normal[pixel * 4 + axis] ?? 0;
  }
  const counts = computeBoxSums(mask, width, height, radius);
  const depthSums = computeBoxSums(depthValues, width, height, radius);
  const normalSums = normalValues.map((values) => computeBoxSums(values, width, height, radius));
  const depth = new Float64Array(pixelCount);
  const normal = new Float64Array(pixelCount * 3);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const count = counts[pixel] ?? 0;
    if (count === 0) continue;
    depth[pixel] = (depthSums[pixel] ?? 0) / count;
    const [x, y, z] = normalSums.map((sums) => sums[pixel] ?? 0) as Vector;
    const length = Math.hypot(x, y, z) || 1;
    normal.set([x / length, y / length, z / length], pixel * 3);
  }
  return { depth, mask: closeFamilyMask(mask, width, height, radius), normal };
};

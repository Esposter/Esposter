import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { GroundPoint } from "genshin-engine";

import { getCentroid } from "#src/services/genshinAssets/points/getCentroid";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The least-squares similarity carrying each pair's source to its target, mirrored first if asked. Centred on both
// Centroids, the turn and scale are one complex factor: the sum of each centred source's conjugate times its target,
// Over the sum of the squared sources. The offset then puts the centroids together. A set with no spread has no turn
// To solve, so it is an error rather than a guess
export const solveSimilarity = (
  pairs: readonly { from: GroundPoint; to: GroundPoint }[],
  mirrored: boolean,
): SimilarityTransform => {
  const sourceOf = ({ x, z }: GroundPoint): GroundPoint => ({ x, z: mirrored ? -z : z });
  const sourceCentroid = getCentroid(pairs.map(({ from }) => sourceOf(from)));
  const targetCentroid = getCentroid(pairs.map(({ to }) => to));
  let real = 0;
  let imaginary = 0;
  let spread = 0;
  for (const { from, to } of pairs) {
    const source = sourceOf(from);
    const sourceX = source.x - sourceCentroid.x;
    const sourceZ = source.z - sourceCentroid.z;
    const targetX = to.x - targetCentroid.x;
    const targetZ = to.z - targetCentroid.z;
    real += sourceX * targetX + sourceZ * targetZ;
    imaginary += sourceX * targetZ - sourceZ * targetX;
    spread += sourceX ** 2 + sourceZ ** 2;
  }
  if (spread === 0) throw new InvalidOperationError(Operation.Read, "similarity", "has no spread to solve a turn from");
  const factorReal = real / spread;
  const factorImaginary = imaginary / spread;
  return {
    mirrored,
    offset: {
      x: targetCentroid.x - (factorReal * sourceCentroid.x - factorImaginary * sourceCentroid.z),
      z: targetCentroid.z - (factorReal * sourceCentroid.z + factorImaginary * sourceCentroid.x),
    },
    scale: Math.hypot(factorReal, factorImaginary),
    turn: Math.atan2(factorImaginary, factorReal),
  };
};

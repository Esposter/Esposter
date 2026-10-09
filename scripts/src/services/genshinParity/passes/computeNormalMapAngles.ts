import { computeNormalAngle } from "#src/services/genshinParity/passes/computeNormalAngle";
import { SPLIT_BLOCK_PIXELS } from "#src/services/genshinParity/passes/constants";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// How far each family's own normal maps bend its normals, from one view's normal target and the normal its geometry
// Carries before the maps: the angle between the two on average over the pixels the family draws, in degrees, and the
// Same over each half of them split by blocks of `SPLIT_BLOCK_PIXELS` as a chequerboard, the two halves read against
// Each other where a statistic of the bend is matched in distribution. A stand-in drawn with none of the maps reads at
// Least the whole family's angle against the normal target, however exact its geometry. A family that draws no pixel
// Is left out
export const computeNormalMapAngles = (
  normal: Float32Array,
  geometryNormal: Float32Array,
  part: Float32Array,
  width: number,
  familyCount: number,
): { angle: number; family: number; halves: [number, number] }[] => {
  const sums = Array.from({ length: familyCount }, () => ({ angles: [0, 0], counts: [0, 0] }));
  for (let pixel = 0; pixel < part.length / 4; pixel++) {
    const sum = sums[readTargetFamily(part, pixel)];
    if (!sum) continue;
    const blockX = Math.floor((pixel % width) / SPLIT_BLOCK_PIXELS);
    const blockY = Math.floor(Math.floor(pixel / width) / SPLIT_BLOCK_PIXELS);
    const half = (blockX + blockY) % 2;
    sum.angles[half] = (sum.angles[half] ?? 0) + computeNormalAngle(normal, geometryNormal, pixel);
    sum.counts[half] = (sum.counts[half] ?? 0) + 1;
  }
  return sums.flatMap(({ angles: [evenAngle = 0, oddAngle = 0], counts: [evenCount = 0, oddCount = 0] }, family) =>
    evenCount + oddCount === 0
      ? []
      : [
          {
            angle: (evenAngle + oddAngle) / (evenCount + oddCount),
            family,
            halves: [evenCount > 0 ? evenAngle / evenCount : 0, oddCount > 0 ? oddAngle / oddCount : 0],
          },
        ],
  );
};

import { computeNormalAngle } from "#src/services/genshinParity/passes/computeNormalAngle";
import { SPLIT_BLOCK_PIXELS } from "#src/services/genshinParity/passes/constants";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// How far each family's normals bend off their geometry's, per side, over the pixels both sides draw: the mean bend of
// Each side, and the exports' bend over each half of the family's blocks of `SPLIT_BLOCK_PIXELS` as a chequerboard. The
// Two halves read against each other are the floor a bend matched in distribution is gated at
export interface SurfaceBend {
  exportsAngle: number;
  family: number;
  halves: [number, number];
  oursAngle: number;
}
// One side of a view's shape: its normal target as drawn, its normal target before any normal detail, and its part target
export interface SurfaceBendSide {
  geometryNormal: Float32Array;
  normal: Float32Array;
  part: Float32Array;
}
// The bend of each family's surface detail, from the exports' and ours' normal and geometry normal targets. A family
// Both sides draw no pixel of is left out
export const computeSurfaceBend = (
  exports: SurfaceBendSide,
  ours: SurfaceBendSide,
  width: number,
  familyCount: number,
): SurfaceBend[] => {
  const sums = Array.from({ length: familyCount }, () => ({
    counts: [0, 0],
    exportsAngles: [0, 0],
    oursAngles: [0, 0],
  }));
  for (let pixel = 0; pixel < exports.part.length / 4; pixel++) {
    const family = readTargetFamily(exports.part, pixel);
    const sum = sums[family];
    if (!sum || readTargetFamily(ours.part, pixel) !== family) continue;
    const blockX = Math.floor((pixel % width) / SPLIT_BLOCK_PIXELS);
    const blockY = Math.floor(Math.floor(pixel / width) / SPLIT_BLOCK_PIXELS);
    const half = (blockX + blockY) % 2;
    sum.exportsAngles[half] =
      (sum.exportsAngles[half] ?? 0) + computeNormalAngle(exports.normal, exports.geometryNormal, pixel);
    sum.oursAngles[half] = (sum.oursAngles[half] ?? 0) + computeNormalAngle(ours.normal, ours.geometryNormal, pixel);
    sum.counts[half] = (sum.counts[half] ?? 0) + 1;
  }
  return sums.flatMap(
    (
      {
        counts: [evenCount = 0, oddCount = 0],
        exportsAngles: [evenExports = 0, oddExports = 0],
        oursAngles: [evenOurs = 0, oddOurs = 0],
      },
      family,
    ) =>
      evenCount + oddCount === 0
        ? []
        : [
            {
              exportsAngle: (evenExports + oddExports) / (evenCount + oddCount),
              family,
              halves: [evenCount > 0 ? evenExports / evenCount : 0, oddCount > 0 ? oddExports / oddCount : 0],
              oursAngle: (evenOurs + oddOurs) / (evenCount + oddCount),
            },
          ],
  );
};
// The bend reading a family is gated on: ours' bend less the exports', in degrees, against the floor the exports' own
// Two halves stand apart by. A family whose exports bend nothing and whose ours bend nothing reads zero against zero
export const getSurfaceBendReading = ({
  exportsAngle,
  halves: [firstHalf, secondHalf],
  oursAngle,
}: SurfaceBend): { gate: number; value: number } => ({
  gate: Math.abs(firstHalf - secondHalf),
  value: Math.abs(oursAngle - exportsAngle),
});

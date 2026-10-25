import type { SurfaceBend } from "#src/models/genshinParity/passes/SurfaceBend";
import type { SurfaceBendSide } from "#src/models/genshinParity/passes/SurfaceBendSide";

import { computeNormalAngle } from "#src/services/genshinParity/passes/computeNormalAngle";
import { readBlockHalf } from "#src/services/genshinParity/passes/readBlockHalf";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

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
    const half = readBlockHalf(pixel, width);
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

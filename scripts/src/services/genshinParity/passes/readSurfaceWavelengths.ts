import type { SurfaceBendSide } from "#src/models/genshinParity/passes/SurfaceBendSide";

import { computeNormalAngle } from "#src/services/genshinParity/passes/computeNormalAngle";
import { computeSurfaceWavelength } from "#src/services/genshinParity/passes/computeSurfaceWavelength";
import { SURFACE_HIGH_PASS_RADIUS_PIXELS, SURFACE_LAG_CAP_SHARE } from "#src/services/genshinParity/passes/constants";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";

// The dominant wavelength of one family's normal angles in the exports' frame and in ours, over the pixels both draw as
// The family, each side's normal against its own geometry (`computeNormalAngle`). Both read at the family's median depth
// And the frame's field of view. The lag is capped at a share of the family's own width in pixels, so a variation the
// Size of the object is shape and never a detail. The metres a pixel spans at that depth come back with them, as the gate
export const readSurfaceWavelengths = ({
  depth,
  exports,
  family,
  fovDegrees,
  height,
  ours,
  width,
}: {
  depth: Float32Array;
  exports: SurfaceBendSide;
  family: number;
  fovDegrees: number;
  height: number;
  ours: SurfaceBendSide;
  width: number;
}): { exportsWavelength?: number | undefined; metresPerPixel: number; oursWavelength?: number | undefined } => {
  const pixelCount = exports.part.length / 4;
  const exportsAngles = new Float64Array(pixelCount).fill(Number.NaN);
  const oursAngles = new Float64Array(pixelCount).fill(Number.NaN);
  const depths: number[] = [];
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    if (readTargetFamily(exports.part, pixel) !== family || readTargetFamily(ours.part, pixel) !== family) continue;
    exportsAngles[pixel] = computeNormalAngle(exports.normal, exports.geometryNormal, pixel);
    oursAngles[pixel] = computeNormalAngle(ours.normal, ours.geometryNormal, pixel);
    depths.push(depth[pixel * 4] ?? 0);
    const column = pixel % width;
    left = Math.min(left, column);
    right = Math.max(right, column);
  }
  const sortedDepths = depths.toSorted((firstDepth, secondDepth) => firstDepth - secondDepth);
  const medianDepth = sortedDepths[Math.floor(sortedDepths.length / 2)] ?? 0;
  const metresPerPixel = (2 * medianDepth * Math.tan((fovDegrees * Math.PI) / 360)) / height;
  const maxLag = Math.floor((right - left + 1) * SURFACE_LAG_CAP_SHARE);
  const measure = (angles: Float64Array): number | undefined =>
    depths.length === 0
      ? undefined
      : computeSurfaceWavelength({
          angles,
          depth: medianDepth,
          fovDegrees,
          height,
          highPassRadius: SURFACE_HIGH_PASS_RADIUS_PIXELS,
          maxLag,
          width,
        });
  return { exportsWavelength: measure(exportsAngles), metresPerPixel, oursWavelength: measure(oursAngles) };
};

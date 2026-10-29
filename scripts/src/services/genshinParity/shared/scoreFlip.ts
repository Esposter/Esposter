// FLIP's standard dynamic range metric (NVIDIA, github.com/NVlabs/flip, `FLIP.h`), ported as it stands: both images
// From sRGB to linear, then YCxCz, filtered by the eye's contrast sensitivity at the viewing distance's pixels per
// Degree, clamped in linear RGB and compared in Hunt-adjusted CIELab by the HyAB distance, compressed and remapped; the
// Luminance's edges and points (a Gaussian's first and second derivatives) compared beside it; and each pixel's error
// The colour difference raised to one less the feature difference. The mean of the error map is the one number a scene
// Is judged by, 0 identical and 1 as far apart as two images can be

import type { Vector } from "#src/models/shared/Vector";

import { clamp } from "#src/services/genshinParity/shared/clamp";
import { FLIP_PIXELS_PER_DEGREE } from "#src/services/genshinParity/shared/constants";
import { createFeatureFilter } from "#src/services/genshinParity/shared/createFeatureFilter";
import { createSpatialFilters } from "#src/services/genshinParity/shared/createSpatialFilters";
import { getHyab } from "#src/services/genshinParity/shared/getHyab";
import { toHuntLab } from "#src/services/genshinParity/shared/toHuntLab";
import { xyzToLinear } from "#src/services/genshinParity/shared/xyzToLinear";
import { xyzToYcxcz } from "#src/services/genshinParity/shared/xyzToYcxcz";
import { ycxczToXyz } from "#src/services/genshinParity/shared/ycxczToXyz";
import { toLinear } from "#src/services/shared/toLinear";
import { toXyz } from "#src/services/shared/toXyz";

const QC = 0.7;
const PC = 0.4;
const PT = 0.95;
const QF = 0.5;
// The farthest two colours can be, green from blue, compressed as every difference is
const MAX_DISTANCE = getHyab(toHuntLab([0, 1, 0]), toHuntLab([0, 0, 1])) ** QC;

// The FLIP error map of a test image against a reference, both sRGB with three channels a pixel in [0, 1], and its mean
export const scoreFlip = (
  reference: Float32Array,
  test: Float32Array,
  width: number,
  height: number,
  pixelsPerDegree: number = FLIP_PIXELS_PER_DEGREE,
): { errorMap: Float32Array; mean: number } => {
  const pixelCount = width * height;
  const toYcxcz = (image: Float32Array): Float32Array => {
    const converted = new Float32Array(pixelCount * 3);
    for (let pixel = 0; pixel < pixelCount; pixel++) {
      const linear: Vector = [0, 1, 2].map((channel) =>
        toLinear(clamp(image[pixel * 3 + channel] ?? 0, 0, 1)),
      ) as Vector;
      converted.set(xyzToYcxcz(toXyz(linear)), pixel * 3);
    }
    return converted;
  };
  const [referenceYcxcz, testYcxcz] = [toYcxcz(reference), toYcxcz(test)];
  const { cz, ycx } = createSpatialFilters(pixelsPerDegree);
  const spatialRadius = (ycx.length - 1) / 2;
  const at = (x: number, y: number): number =>
    Math.min(Math.max(y, 0), height - 1) * width + Math.min(Math.max(x, 0), width - 1);
  // Filtered along x, four channels a pixel: the achromatic, the red-green, and the blue-yellow's two Gaussians
  const filterAlongX = (image: Float32Array): Float32Array => {
    const filtered = new Float32Array(pixelCount * 4);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        let sumY = 0;
        let sumCx = 0;
        let sumCz1 = 0;
        let sumCz2 = 0;
        for (let offset = -spatialRadius; offset <= spatialRadius; offset++) {
          const source = at(x + offset, y) * 3;
          const [wy = 0, wx = 0] = ycx[offset + spatialRadius] ?? [];
          const [w1 = 0, w2 = 0] = cz[offset + spatialRadius] ?? [];
          sumY += wy * (image[source] ?? 0);
          sumCx += wx * (image[source + 1] ?? 0);
          sumCz1 += w1 * (image[source + 2] ?? 0);
          sumCz2 += w2 * (image[source + 2] ?? 0);
        }
        filtered.set([sumY, sumCx, sumCz1, sumCz2], (y * width + x) * 4);
      }
    return filtered;
  };
  const [referenceAlongX, testAlongX] = [filterAlongX(referenceYcxcz), filterAlongX(testYcxcz)];
  const computeFilteredLab = (alongX: Float32Array, x: number, y: number): Vector => {
    let sumY = 0;
    let sumCx = 0;
    let sumCz1 = 0;
    let sumCz2 = 0;
    for (let offset = -spatialRadius; offset <= spatialRadius; offset++) {
      const source = at(x, y + offset) * 4;
      const [wy = 0, wx = 0] = ycx[offset + spatialRadius] ?? [];
      const [w1 = 0, w2 = 0] = cz[offset + spatialRadius] ?? [];
      sumY += wy * (alongX[source] ?? 0);
      sumCx += wx * (alongX[source + 1] ?? 0);
      sumCz1 += w1 * (alongX[source + 2] ?? 0);
      sumCz2 += w2 * (alongX[source + 3] ?? 0);
    }
    const linear = xyzToLinear(ycxczToXyz([sumY, sumCx, sumCz1 + sumCz2])).map((value) => clamp(value, 0, 1)) as Vector;
    return toHuntLab(linear);
  };
  const colorDifferences = new Float32Array(pixelCount);
  const pcMax = PC * MAX_DISTANCE;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const difference = getHyab(computeFilteredLab(referenceAlongX, x, y), computeFilteredLab(testAlongX, x, y)) ** QC;
      colorDifferences[y * width + x] =
        difference < pcMax
          ? (difference * PT) / pcMax
          : PT + ((difference - pcMax) / (MAX_DISTANCE - pcMax)) * (1 - PT);
    }
  const featureFilter = createFeatureFilter(pixelsPerDegree);
  const featureRadius = (featureFilter.length - 1) / 2;
  // The luminance normalised to [0, 1], filtered along x: its first and second derivatives, and its Gaussian blur
  const featuresAlongX = (image: Float32Array): Float32Array => {
    const filtered = new Float32Array(pixelCount * 3);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        let first = 0;
        let second = 0;
        let blurred = 0;
        for (let offset = -featureRadius; offset <= featureRadius; offset++) {
          const luminance = ((image[at(x + offset, y) * 3] ?? 0) + 16) / 116;
          const [wg = 0, w1 = 0, w2 = 0] = featureFilter[offset + featureRadius] ?? [];
          first += w1 * luminance;
          second += w2 * luminance;
          blurred += wg * luminance;
        }
        filtered.set([first, second, blurred], (y * width + x) * 3);
      }
    return filtered;
  };
  const [referenceFeatures, testFeatures] = [featuresAlongX(referenceYcxcz), featuresAlongX(testYcxcz)];
  const computeFeatures = (features: Float32Array, x: number, y: number): [number, number] => {
    let dx = 0;
    let ddx = 0;
    let dy = 0;
    let ddy = 0;
    for (let offset = -featureRadius; offset <= featureRadius; offset++) {
      const source = at(x, y + offset) * 3;
      const [wg = 0, w1 = 0, w2 = 0] = featureFilter[offset + featureRadius] ?? [];
      dx += wg * (features[source] ?? 0);
      ddx += wg * (features[source + 1] ?? 0);
      dy += w1 * (features[source + 2] ?? 0);
      ddy += w2 * (features[source + 2] ?? 0);
    }
    return [Math.hypot(dx, dy), Math.hypot(ddx, ddy)];
  };
  const errorMap = new Float32Array(pixelCount);
  let sum = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [referenceEdge, referencePoint] = computeFeatures(referenceFeatures, x, y);
      const [testEdge, testPoint] = computeFeatures(testFeatures, x, y);
      const featureDifference =
        (Math.SQRT1_2 * Math.max(Math.abs(referenceEdge - testEdge), Math.abs(referencePoint - testPoint))) ** QF;
      const error = (colorDifferences[y * width + x] ?? 0) ** (1 - featureDifference);
      errorMap[y * width + x] = error;
      sum += error;
    }
  return { errorMap, mean: sum / pixelCount };
};

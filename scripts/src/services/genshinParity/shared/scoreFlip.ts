// FLIP's standard dynamic range metric (NVIDIA, github.com/NVlabs/flip, `FLIP.h`), ported as it stands: both images
// From sRGB to linear, then YCxCz, filtered by the eye's contrast sensitivity at the viewing distance's pixels per
// Degree, clamped in linear RGB and compared in Hunt-adjusted CIELab by the HyAB distance, compressed and remapped; the
// Luminance's edges and points (a Gaussian's first and second derivatives) compared beside it; and each pixel's error
// The colour difference raised to one less the feature difference. The mean of the error map is the one number a scene
// Is approved by, 0 identical and 1 as far apart as two images can be
import type { Vector } from "#src/models/shared/Vector";

import { FLIP_PIXELS_PER_DEGREE } from "#src/services/genshinParity/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";

const QC = 0.7;
const PC = 0.4;
const PT = 0.95;
const W = 0.082;
const QF = 0.5;
const ILLUMINANT: Vector = [0.950428545, 1, 1.088900371];
const GAUSSIAN_A1: Vector = [1, 1, 34.1];
const GAUSSIAN_B1: Vector = [0.0047, 0.0053, 0.04];
const GAUSSIAN_A2: Vector = [0, 0, 13.5];
const GAUSSIAN_B2: Vector = [1e-5, 1e-5, 0.025];

const linearToXyz = ([r, g, b]: Vector): Vector => [
  (10_135_552 / 24_577_794) * r + (8_788_810 / 24_577_794) * g + (4_435_075 / 24_577_794) * b,
  (2_613_072 / 12_288_897) * r + (8_788_810 / 12_288_897) * g + (887_015 / 12_288_897) * b,
  (1_425_312 / 73_733_382) * r + (8_788_810 / 73_733_382) * g + (70_074_185 / 73_733_382) * b,
];
const xyzToLinear = ([x, y, z]: Vector): Vector => [
  3.241003275 * x - 1.537398934 * y - 0.498615861 * z,
  -0.969224334 * x + 1.875930071 * y + 0.041554224 * z,
  0.055639423 * x - 0.204011202 * y + 1.057148933 * z,
];
const xyzToLab = ([x, y, z]: Vector): Vector => {
  const delta = 6 / 29;
  const cube = delta ** 3;
  const toF = (value: number): number => (value > cube ? Math.cbrt(value) : value / (3 * delta * delta) + 4 / 29);
  const [fx, fy, fz] = [toF(x / ILLUMINANT[0]), toF(y / ILLUMINANT[1]), toF(z / ILLUMINANT[2])];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
const xyzToYcxcz = ([x, y, z]: Vector): Vector => {
  const [nx, ny, nz] = [x / ILLUMINANT[0], y / ILLUMINANT[1], z / ILLUMINANT[2]];
  return [116 * ny - 16, 500 * (nx - ny), 200 * (ny - nz)];
};
const ycxczToXyz = ([luminance, cx, cz]: Vector): Vector => {
  const y = (luminance + 16) / 116;
  return [(y + cx / 500) * ILLUMINANT[0], y * ILLUMINANT[1], (y - cz / 200) * ILLUMINANT[2]];
};
const clamp = (value: number): number => Math.min(Math.max(value, 0), 1);
const toHuntLab = (linear: Vector): Vector => {
  const [l, a, b] = xyzToLab(linearToXyz(linear));
  return [l, 0.01 * l * a, 0.01 * l * b];
};
const getHyab = ([l1, a1, b1]: Vector, [l2, a2, b2]: Vector): number =>
  Math.abs(l1 - l2) + Math.hypot(a1 - a2, b1 - b2);
// The farthest two colours can be, green from blue, compressed as every difference is
const MAX_DISTANCE = getHyab(toHuntLab([0, 1, 0]), toHuntLab([0, 0, 1])) ** QC;
const getGaussian = (x2: number, a: number, b: number): number =>
  a * Math.sqrt(Math.PI / b) * Math.exp((-Math.PI * Math.PI * x2) / b);
const getGaussianSqrt = (x2: number, a: number, b: number): number =>
  Math.sqrt(a * Math.sqrt(Math.PI / b)) * Math.exp((-Math.PI * Math.PI * x2) / b);
// The contrast sensitivity filters, separated: one for the achromatic and red-green channels, and the blue-yellow's sum
// Of two Gaussians as two filters whose squares sum to it
const createSpatialFilters = (pixelsPerDegree: number): { cz: [number, number][]; ycx: [number, number][] } => {
  const largest = Math.max(...GAUSSIAN_B1, GAUSSIAN_B2[0], GAUSSIAN_B2[1], GAUSSIAN_B2[2]);
  const radius = Math.ceil(3 * Math.sqrt(largest / (2 * Math.PI * Math.PI)) * pixelsPerDegree);
  const ycx: [number, number][] = [];
  const cz: [number, number][] = [];
  for (let offset = -radius; offset <= radius; offset++) {
    const x2 = (offset / pixelsPerDegree) ** 2;
    ycx.push([getGaussian(x2, GAUSSIAN_A1[0], GAUSSIAN_B1[0]), getGaussian(x2, GAUSSIAN_A1[1], GAUSSIAN_B1[1])]);
    cz.push([getGaussianSqrt(x2, GAUSSIAN_A1[2], GAUSSIAN_B1[2]), getGaussianSqrt(x2, GAUSSIAN_A2[2], GAUSSIAN_B2[2])]);
  }
  const [sumY, sumCx] = ycx.reduce(([y, x], [wy, wx]) => [y + wy, x + wx], [0, 0]);
  const [sumCz1, sumCz2] = cz.reduce(([first, second], [w1, w2]) => [first + w1, second + w2], [0, 0]);
  const czNorm = 1 / Math.hypot(sumCz1, sumCz2);
  return { cz: cz.map(([w1, w2]) => [w1 * czNorm, w2 * czNorm]), ycx: ycx.map(([wy, wx]) => [wy / sumY, wx / sumCx]) };
};
// The edge and point filters: a Gaussian, its first and its second derivative, each normalised as FLIP normalises them
const createFeatureFilter = (pixelsPerDegree: number): Vector[] => {
  const deviation = 0.5 * W * pixelsPerDegree;
  const radius = Math.ceil(3 * deviation);
  const weights: Vector[] = [];
  let gaussianSum = 0;
  let firstPositive = 0;
  let firstNegative = 0;
  let secondPositive = 0;
  let secondNegative = 0;
  for (let offset = -radius; offset <= radius; offset++) {
    const gaussian = Math.exp(-(offset * offset) / (2 * deviation * deviation));
    const first = -offset * gaussian;
    const second = ((offset * offset) / (deviation * deviation) - 1) * gaussian;
    gaussianSum += gaussian;
    if (first > 0) firstPositive += first;
    else firstNegative -= first;
    if (second > 0) secondPositive += second;
    else secondNegative -= second;
    weights.push([gaussian, first, second]);
  }
  return weights.map(([gaussian, first, second]) => [
    gaussian / gaussianSum,
    first / (first > 0 ? firstPositive : firstNegative),
    second / (second > 0 ? secondPositive : secondNegative),
  ]);
};
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
      const linear: Vector = [0, 1, 2].map((channel) => toLinear(clamp(image[pixel * 3 + channel] ?? 0))) as Vector;
      converted.set(xyzToYcxcz(linearToXyz(linear)), pixel * 3);
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
    const linear = xyzToLinear(ycxczToXyz([sumY, sumCx, sumCz1 + sumCz2])).map((value) => clamp(value)) as Vector;
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

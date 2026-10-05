import type { LabelPlanes } from "#src/models/genshinParity/witness/LabelPlanes";

import { blurGrey } from "#src/services/genshinParity/shared/blurGrey";

// Multi-scale structural similarity (Wang, Simoncelli and Bovik, 2003) over two grey images, read apart for each label
// Of a map: at each of five scales, halving the size each time, a Gaussian window's means, variances and covariance
// Give each pixel its contrast and structure term, the coarsest its luminance term too, each scale's terms averaged
// Over a label's pixels and the scales weighted as the paper weights them. Detail a few pixels off scores at the
// Coarser scales where FLIP charges it twice, and detail missing scores nothing at any, so a surface whose carving is
// Aligned but imperfect reads closer than a bare one. 1 identical, 0 nothing alike
const SCALE_WEIGHTS = [0.0448, 0.2856, 0.3001, 0.2363, 0.1333];
const WINDOW_SIGMA = 1.5;
const LUMINANCE_CONSTANT = 0.01 ** 2;
const CONTRAST_CONSTANT = 0.03 ** 2;
// Half the size, each pixel the mean of the four it covers
const halve = (values: Float32Array, width: number, height: number): Float32Array => {
  const halfWidth = Math.floor(width / 2);
  return Float32Array.from({ length: halfWidth * Math.floor(height / 2) }, (_, index) => {
    const x = (index % halfWidth) * 2;
    const y = Math.floor(index / halfWidth) * 2;
    return (
      ((values[y * width + x] ?? 0) +
        (values[y * width + x + 1] ?? 0) +
        (values[(y + 1) * width + x] ?? 0) +
        (values[(y + 1) * width + x + 1] ?? 0)) /
      4
    );
  });
};
// Each label's similarity between two grey images in [0, 1] of one size, a label of -1 read by none; a label with no
// Pixel left at a scale keeps the terms it had. A coarser scale carries each label's share of a pixel rather than one
// Label per pixel, so a pixel two labels share reads for both
export const scoreLabelSimilarity = (
  reference: Float32Array,
  shot: Float32Array,
  width: number,
  height: number,
  labels: Int32Array,
  labelCount: number,
): number[] =>
  Array.from({ length: labelCount }, (_, label) => {
    const labelCoverage = Float32Array.from(labels, (pixelLabel) => (pixelLabel === label ? 1 : 0));
    let planes: LabelPlanes = {
      coverage: labelCoverage,
      first: reference.map((value, index) => value * (labelCoverage[index] ?? 0)),
      height,
      second: shot.map((value, index) => value * (labelCoverage[index] ?? 0)),
      width,
    };
    let score = 1;
    for (const [scale, weight] of SCALE_WEIGHTS.entries()) {
      const isCoarsest = scale === SCALE_WEIGHTS.length - 1;
      const { coverage, first, height: levelHeight, second, width: levelWidth } = planes;
      const blurLevel = (values: Float32Array) => blurGrey(values, levelWidth, levelHeight, WINDOW_SIGMA);
      // Over a label's coverage c, an image x weighted by it is x·c, so its square is (x·c)²/c and two images' product
      // (x·c)(y·c)/c
      const divide = (values: Float32Array) =>
        values.map((value, index) => ((coverage[index] ?? 0) > 0 ? value / (coverage[index] ?? 1) : 0));
      const coverageMean = blurLevel(coverage);
      const firstMean = blurLevel(first);
      const secondMean = blurLevel(second);
      const firstSquare = blurLevel(divide(first.map((value) => value * value)));
      const secondSquare = blurLevel(divide(second.map((value) => value * value)));
      const product = blurLevel(divide(first.map((value, index) => value * (second[index] ?? 0))));
      let sum = 0;
      let count = 0;
      for (const [index, share] of coverage.entries()) {
        const windowCoverage = coverageMean[index] ?? 0;
        if (share === 0 || windowCoverage === 0) continue;
        const firstAverage = (firstMean[index] ?? 0) / windowCoverage;
        const secondAverage = (secondMean[index] ?? 0) / windowCoverage;
        const firstVariance = Math.max((firstSquare[index] ?? 0) / windowCoverage - firstAverage ** 2, 0);
        const secondVariance = Math.max((secondSquare[index] ?? 0) / windowCoverage - secondAverage ** 2, 0);
        const covariance = (product[index] ?? 0) / windowCoverage - firstAverage * secondAverage;
        let term = (2 * covariance + CONTRAST_CONSTANT) / (firstVariance + secondVariance + CONTRAST_CONSTANT);
        if (isCoarsest)
          term *=
            (2 * firstAverage * secondAverage + LUMINANCE_CONSTANT) /
            (firstAverage ** 2 + secondAverage ** 2 + LUMINANCE_CONSTANT);
        sum += term * share;
        count += share;
      }
      if (count > 0) score *= Math.max(sum / count, 0) ** weight;
      if (isCoarsest) break;
      planes = {
        coverage: halve(coverage, levelWidth, levelHeight),
        first: halve(first, levelWidth, levelHeight),
        height: Math.floor(levelHeight / 2),
        second: halve(second, levelWidth, levelHeight),
        width: Math.floor(levelWidth / 2),
      };
    }
    return score;
  });

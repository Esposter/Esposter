import { blurGrey } from "#src/services/genshinParity/blurGrey";

// Multi-scale structural similarity (Wang, Simoncelli and Bovik, 2003) over two grey images, read apart for each label
// Of a map: at each of five scales, halving the size each time, a Gaussian window's means, variances and covariance
// Give each pixel its contrast and structure term, the coarsest its luminance term too, each scale's terms averaged over
// A label's pixels and the scales weighted as the paper weights them. Detail a few pixels off scores at the coarser
// Scales where FLIP charges it twice, and detail missing scores nothing at any, so a surface whose carving is aligned
// But imperfect reads closer than a bare one. 1 identical, 0 nothing alike
const SCALE_WEIGHTS = [0.0448, 0.2856, 0.3001, 0.2363, 0.1333];
const WINDOW_SIGMA = 1.5;
const LUMINANCE_CONSTANT = 0.01 ** 2;
const CONTRAST_CONSTANT = 0.03 ** 2;
// Half the size, each pixel the mean of the four it covers and its label the first of them
const halve = (
  first: Float32Array,
  second: Float32Array,
  labels: Int32Array,
  width: number,
  height: number,
): { first: Float32Array; height: number; labels: Int32Array; second: Float32Array; width: number } => {
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  const average = (values: Float32Array) =>
    Float32Array.from({ length: halfWidth * halfHeight }, (_, index) => {
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
  const halfLabels = Int32Array.from({ length: halfWidth * halfHeight }, (_, index) => {
    const x = (index % halfWidth) * 2;
    const y = Math.floor(index / halfWidth) * 2;
    return labels[y * width + x] ?? -1;
  });
  return { first: average(first), height: halfHeight, labels: halfLabels, second: average(second), width: halfWidth };
};
// Each label's similarity between two grey images in [0, 1] of one size, a label of -1 read by none; a label with no
// Pixel left at a scale keeps the terms it had
export const scoreLabelSimilarity = (
  reference: Float32Array,
  shot: Float32Array,
  width: number,
  height: number,
  labels: Int32Array,
  labelCount: number,
): number[] => {
  const scores = Array.from({ length: labelCount }, () => 1);
  let level = { first: reference, height, labels, second: shot, width };
  for (const [scale, weight] of SCALE_WEIGHTS.entries()) {
    const isCoarsest = scale === SCALE_WEIGHTS.length - 1;
    const { first, height: levelHeight, labels: levelLabels, second, width: levelWidth } = level;
    const firstMean = blurGrey(first, levelWidth, levelHeight, WINDOW_SIGMA);
    const secondMean = blurGrey(second, levelWidth, levelHeight, WINDOW_SIGMA);
    const firstSquare = blurGrey(
      first.map((value) => value * value),
      levelWidth,
      levelHeight,
      WINDOW_SIGMA,
    );
    const secondSquare = blurGrey(
      second.map((value) => value * value),
      levelWidth,
      levelHeight,
      WINDOW_SIGMA,
    );
    const product = blurGrey(
      first.map((value, index) => value * (second[index] ?? 0)),
      levelWidth,
      levelHeight,
      WINDOW_SIGMA,
    );
    const sums = new Float64Array(labelCount);
    const counts = new Float64Array(labelCount);
    for (const [index, label] of levelLabels.entries()) {
      if (label < 0) continue;
      const firstAverage = firstMean[index] ?? 0;
      const secondAverage = secondMean[index] ?? 0;
      const firstVariance = Math.max((firstSquare[index] ?? 0) - firstAverage ** 2, 0);
      const secondVariance = Math.max((secondSquare[index] ?? 0) - secondAverage ** 2, 0);
      const covariance = (product[index] ?? 0) - firstAverage * secondAverage;
      let term = (2 * covariance + CONTRAST_CONSTANT) / (firstVariance + secondVariance + CONTRAST_CONSTANT);
      if (isCoarsest)
        term *=
          (2 * firstAverage * secondAverage + LUMINANCE_CONSTANT) /
          (firstAverage ** 2 + secondAverage ** 2 + LUMINANCE_CONSTANT);
      sums[label] = (sums[label] ?? 0) + term;
      counts[label] = (counts[label] ?? 0) + 1;
    }
    for (let label = 0; label < labelCount; label++) {
      const count = counts[label] ?? 0;
      if (count === 0) continue;
      scores[label] = (scores[label] ?? 1) * Math.max((sums[label] ?? 0) / count, 0) ** weight;
    }
    if (!isCoarsest) level = halve(first, second, levelLabels, levelWidth, levelHeight);
  }
  return scores;
};

import type { Vector } from "#src/models/shared/Vector";

const W = 0.082;

// The edge and point filters: a Gaussian, its first and its second derivative, each normalised as FLIP normalises them
export const createFeatureFilter = (pixelsPerDegree: number): Vector[] => {
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

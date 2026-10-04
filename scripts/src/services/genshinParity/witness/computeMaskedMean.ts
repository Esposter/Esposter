// The mean of the distances at the pixels a mask sets, or Infinity where it sets none, so an empty mask never prices best
export const computeMaskedMean = (mask: Uint8Array, distances: Float32Array): number => {
  let sum = 0;
  let count = 0;
  for (const [pixel, isSet] of mask.entries())
    if (isSet) {
      sum += distances[pixel] ?? 0;
      count++;
    }
  return count ? sum / count : Infinity;
};

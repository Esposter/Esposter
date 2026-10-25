// The mean of a distance map over a mask's pixels, as far as can be where the mask holds none
export const readMaskMean = (mask: Uint8Array, distances: Float32Array): number => {
  let [sum, count] = [0, 0];
  for (const [pixel, isSet] of mask.entries())
    if (isSet) {
      sum += distances[pixel] ?? 0;
      count++;
    }
  return count > 0 ? sum / count : Infinity;
};

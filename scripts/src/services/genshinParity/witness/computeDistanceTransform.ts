// Each pixel's distance to the nearest set pixel of a mask, in pixels, by the two-pass chamfer with the 3-4 weights
// (within a few percent of the Euclidean distance); a mask with none set is everywhere as far as the image is wide
const STRAIGHT = 3;
const DIAGONAL = 4;

export const computeDistanceTransform = (mask: Uint8Array, width: number, height: number): Float32Array => {
  const far = (width + height) * DIAGONAL;
  const distances = Float32Array.from(mask, (value) => (value ? 0 : far));
  const relax = (index: number, neighbour: number, weight: number): void => {
    const candidate = (distances[neighbour] ?? far) + weight;
    if (candidate < (distances[index] ?? far)) distances[index] = candidate;
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (x > 0) relax(index, index - 1, STRAIGHT);
      if (y > 0) {
        relax(index, index - width, STRAIGHT);
        if (x > 0) relax(index, index - width - 1, DIAGONAL);
        if (x < width - 1) relax(index, index - width + 1, DIAGONAL);
      }
    }
  for (let y = height - 1; y >= 0; y--)
    for (let x = width - 1; x >= 0; x--) {
      const index = y * width + x;
      if (x < width - 1) relax(index, index + 1, STRAIGHT);
      if (y < height - 1) {
        relax(index, index + width, STRAIGHT);
        if (x < width - 1) relax(index, index + width + 1, DIAGONAL);
        if (x > 0) relax(index, index + width - 1, DIAGONAL);
      }
    }
  return distances.map((distance) => Math.min(distance, far) / STRAIGHT);
};

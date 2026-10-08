import type { Vector } from "#src/models/shared/Vector";

import { clusterVectors } from "#src/services/genshinAssets/fit/clusterVectors";

// Colours grouped into as many clusters as asked by k-means, each colour in the cluster whose mean it lies nearest:
// Seeded at the colours standing at even shares of the way from darkest to lightest by their channels' sum, so the same
// Colours always cluster the same way. Returns each colour's cluster
export const clusterColours = (colours: readonly Vector[], count: number): Int32Array => {
  const order = colours
    .map((colour, index) => ({ index, sum: colour[0] + colour[1] + colour[2] }))
    .toSorted((firstColour, secondColour) => firstColour.sum - secondColour.sum);
  const means = Array.from(
    { length: count },
    (_mean, cluster): Vector =>
      colours[order[Math.floor(((cluster + 0.5) / count) * order.length)]?.index ?? 0] ?? [0, 0, 0],
  );
  return clusterVectors(colours, means);
};

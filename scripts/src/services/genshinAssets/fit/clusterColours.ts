import type { Vector } from "#src/models/shared/Vector";

// Lloyd's iterations past which the clusters are taken as they stand, far more than a few thousand colours ever need
const MAX_ITERATIONS = 100;
const computeDistance = (
  [firstRed, firstGreen, firstBlue]: Vector,
  [secondRed, secondGreen, secondBlue]: Vector,
): number => (firstRed - secondRed) ** 2 + (firstGreen - secondGreen) ** 2 + (firstBlue - secondBlue) ** 2;
// Colours grouped into as many clusters as asked by k-means, each colour in the cluster whose mean it lies nearest:
// Seeded at the colours standing at even shares of the way from darkest to lightest by their channels' sum, so the same
// Colours always cluster the same way, and iterated until no colour changes cluster. Returns each colour's cluster
export const clusterColours = (colours: readonly Vector[], count: number): Int32Array => {
  const order = colours
    .map((colour, index) => ({ index, sum: colour[0] + colour[1] + colour[2] }))
    .toSorted((firstColour, secondColour) => firstColour.sum - secondColour.sum);
  let means = Array.from(
    { length: count },
    (_mean, cluster): Vector =>
      colours[order[Math.floor(((cluster + 0.5) / count) * order.length)]?.index ?? 0] ?? [0, 0, 0],
  );
  const clusters = new Int32Array(colours.length).fill(-1);
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let isChanged = false;
    for (const [index, colour] of colours.entries()) {
      let nearest = 0;
      for (let cluster = 1; cluster < count; cluster++)
        if (computeDistance(colour, means[cluster] ?? colour) < computeDistance(colour, means[nearest] ?? colour))
          nearest = cluster;
      if (clusters[index] === nearest) continue;
      clusters[index] = nearest;
      isChanged = true;
    }
    if (!isChanged) break;
    const sums = Array.from({ length: count }, (): [number, number, number, number] => [0, 0, 0, 0]);
    for (const [index, [red, green, blue]] of colours.entries()) {
      const sum = sums[clusters[index] ?? 0];
      if (!sum) continue;
      sum[0] += red;
      sum[1] += green;
      sum[2] += blue;
      sum[3]++;
    }
    means = sums.map(([red, green, blue, total], cluster) =>
      total === 0 ? (means[cluster] ?? [0, 0, 0]) : [red / total, green / total, blue / total],
    );
  }
  return clusters;
};

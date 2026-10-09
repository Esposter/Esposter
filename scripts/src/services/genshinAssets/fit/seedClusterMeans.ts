import type { Vector } from "#src/models/shared/Vector";

const ORIGIN: Vector = [0, 0, 0];
const computeSquaredDistance = ([firstX, firstY, firstZ]: Vector, [secondX, secondY, secondZ]: Vector): number =>
  (firstX - secondX) ** 2 + (firstY - secondY) ** 2 + (firstZ - secondZ) ** 2;
// The means k-means starts from: the first a random point, then each next one drawn with a chance in proportion to its
// Squared distance from the means already drawn (k-means++), so the means start spread across the points rather than
// Bunched in one of them
export const seedClusterMeans = (points: readonly Vector[], count: number, random: () => number): Vector[] => {
  const firstMean = points[Math.floor(random() * points.length)] ?? ORIGIN;
  const means: Vector[] = [firstMean];
  const distances = points.map((point) => computeSquaredDistance(point, firstMean));
  while (means.length < count) {
    const total = distances.reduce((sum, distance) => sum + distance, 0);
    let target = random() * total;
    let index = 0;
    while (index < points.length - 1 && (target -= distances[index] ?? 0) > 0) index++;
    const mean = points[index] ?? firstMean;
    means.push(mean);
    for (const [pointIndex, point] of points.entries())
      distances[pointIndex] = Math.min(distances[pointIndex] ?? 0, computeSquaredDistance(point, mean));
  }
  return means;
};

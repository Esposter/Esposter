import type { Vector } from "#src/models/shared/Vector";
import type { TreeCluster } from "genshin-engine";

import { clusterVectors } from "#src/services/genshinAssets/fit/clusterVectors";
import { getPercentile } from "#src/services/shared/getPercentile";
import { createSeededRandom } from "genshin-engine";

const ORIGIN: Vector = [0, 0, 0];
// How far a cluster reaches: the distance its cards' 90th percentile lies at, so a stray card does not set its radius
const CLUSTER_REACH_FRACTION = 0.9;
const computeSquaredDistance = ([firstX, firstY, firstZ]: Vector, [secondX, secondY, secondZ]: Vector): number =>
  (firstX - secondX) ** 2 + (firstY - secondY) ** 2 + (firstZ - secondZ) ** 2;
// The first mean a random point, then each next one drawn with a chance in proportion to its squared distance from the
// Means already drawn (k-means++), so the means start spread across the points rather than bunched in one of them
const seedMeans = (points: readonly Vector[], count: number, random: () => number): Vector[] => {
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
// Cards grouped by their centres into as many clusters as asked by k-means, seeded by the given seed so the same cards
// Always cluster the same way. Each cluster is the mean of its cards' centres, reaches the distance their 90th
// Percentile lies at from that mean and holds the leaf area they hold between them, and the clusters are sorted by
// Height. A cluster left with no card is dropped
export const clusterCardCentres = (
  cards: readonly { centre: Vector; leafArea: number }[],
  count: number,
  seed: number,
): TreeCluster[] => {
  const centres = cards.map(({ centre }) => centre);
  const means = seedMeans(centres, count, createSeededRandom(seed));
  const clusters = clusterVectors(centres, means);
  return means
    .flatMap((_mean, cluster): TreeCluster[] => {
      const members = cards.filter((_card, index) => clusters[index] === cluster);
      if (members.length === 0) return [];

      const sum = members.reduce<Vector>(
        ([x, y, z], { centre: [memberX, memberY, memberZ] }) => [x + memberX, y + memberY, z + memberZ],
        ORIGIN,
      );
      const centre: Vector = [sum[0] / members.length, sum[1] / members.length, sum[2] / members.length];
      const distances = members.map((member) => Math.sqrt(computeSquaredDistance(member.centre, centre)));
      return [
        {
          leafArea: members.reduce((total, { leafArea }) => total + leafArea, 0),
          radius: getPercentile(distances, CLUSTER_REACH_FRACTION),
          x: centre[0],
          y: centre[1],
          z: centre[2],
        },
      ];
    })
    .toSorted((firstCluster, secondCluster) => firstCluster.y - secondCluster.y);
};

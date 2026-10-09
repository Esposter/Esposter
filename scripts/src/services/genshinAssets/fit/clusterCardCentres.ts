import type { Vector } from "#src/models/shared/Vector";
import type { TreeCluster } from "genshin-engine";

import { clusterVectors } from "#src/services/genshinAssets/fit/clusterVectors";
import { seedClusterMeans } from "#src/services/genshinAssets/fit/seedClusterMeans";
import { getPercentile } from "#src/services/shared/getPercentile";
import { createSeededRandom } from "genshin-engine";

const ORIGIN: Vector = [0, 0, 0];
// How far a cluster reaches: the distance its cards' 90th percentile lies at, so a stray card does not set its radius
const CLUSTER_REACH_FRACTION = 0.9;
const computeSquaredDistance = ([firstX, firstY, firstZ]: Vector, [secondX, secondY, secondZ]: Vector): number =>
  (firstX - secondX) ** 2 + (firstY - secondY) ** 2 + (firstZ - secondZ) ** 2;
// Points grouped into as many clusters as asked by k-means, seeded by the given seed so the same points always cluster
// The same way. Each cluster is the mean of its points and reaches the distance its points' 90th percentile lies at from
// That mean, and the clusters are sorted by height. A cluster left with no point is dropped
export const clusterCardCentres = (points: readonly Vector[], count: number, seed: number): TreeCluster[] => {
  const means = seedClusterMeans(points, count, createSeededRandom(seed));
  const clusters = clusterVectors(points, means);
  return means
    .flatMap((_mean, cluster): TreeCluster[] => {
      const members = points.filter((_point, index) => clusters[index] === cluster);
      if (members.length === 0) return [];

      const sum = members.reduce<Vector>(
        ([x, y, z], [memberX, memberY, memberZ]) => [x + memberX, y + memberY, z + memberZ],
        ORIGIN,
      );
      const centre: Vector = [sum[0] / members.length, sum[1] / members.length, sum[2] / members.length];
      const distances = members.map((member) => Math.sqrt(computeSquaredDistance(member, centre)));
      return [{ radius: getPercentile(distances, CLUSTER_REACH_FRACTION), x: centre[0], y: centre[1], z: centre[2] }];
    })
    .toSorted((firstCluster, secondCluster) => firstCluster.y - secondCluster.y);
};

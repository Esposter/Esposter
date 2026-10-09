import type { Vector } from "#src/models/shared/Vector";

// Lloyd's iterations past which the clusters are taken as they stand, far more than a few thousand vectors ever need
const MAX_ITERATIONS = 100;
const computeDistance = ([firstX, firstY, firstZ]: Vector, [secondX, secondY, secondZ]: Vector): number =>
  (firstX - secondX) ** 2 + (firstY - secondY) ** 2 + (firstZ - secondZ) ** 2;
// Vectors grouped into as many clusters as there are means by k-means, each vector in the cluster whose mean it lies
// Nearest, the means moved to their clusters' centres and iterated until no vector changes cluster. Returns each
// Vector's cluster
export const clusterVectors = (vectors: readonly Vector[], means: readonly Vector[]): Int32Array => {
  const centres = [...means];
  const clusters = new Int32Array(vectors.length).fill(-1);
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let isChanged = false;
    for (const [index, vector] of vectors.entries()) {
      let nearest = 0;
      for (let cluster = 1; cluster < centres.length; cluster++)
        if (computeDistance(vector, centres[cluster] ?? vector) < computeDistance(vector, centres[nearest] ?? vector))
          nearest = cluster;
      if (clusters[index] === nearest) continue;
      clusters[index] = nearest;
      isChanged = true;
    }
    if (!isChanged) break;
    const sums = Array.from({ length: centres.length }, (): [number, number, number, number] => [0, 0, 0, 0]);
    for (const [index, [x, y, z]] of vectors.entries()) {
      const sum = sums[clusters[index] ?? 0];
      if (!sum) continue;
      sum[0] += x;
      sum[1] += y;
      sum[2] += z;
      sum[3]++;
    }
    for (const [cluster, [x, y, z, total]] of sums.entries())
      if (total > 0) centres[cluster] = [x / total, y / total, z / total];
  }
  return clusters;
};

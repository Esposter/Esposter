import type { DominantColour } from "#src/models/genshinAssets/palette/DominantColour";
import type { Vector } from "#src/models/shared/Vector";

import { clusterColours } from "#src/services/genshinAssets/fit/clusterColours";
import { computeSquaredDistance } from "#src/services/genshinAssets/fit/computeSquaredDistance";

// The clusters the linear texels of a family are grouped into, the largest of them taken as its colour
const PALETTE_CLUSTER_COUNT = 4;
// The channels a texel is measured over, so the scatter is per channel rather than over all three at once
const CHANNEL_COUNT = 3;

// The colour a family paints its part with: the mean of its largest cluster of linear texels, so the most common tone
// Wins over the lines and wear its texture carries. The spread is the root mean square difference of that cluster's texels
// From its mean, per linear channel. Takes at least one texel
export const computeDominantColour = (texels: readonly Vector[]): DominantColour => {
  const clusters = clusterColours(texels, PALETTE_CLUSTER_COUNT);
  const sizes = Array.from({ length: PALETTE_CLUSTER_COUNT }, () => 0);
  for (const cluster of clusters) sizes[cluster] = (sizes[cluster] ?? 0) + 1;
  const dominant = sizes.indexOf(Math.max(...sizes));
  const members = texels.filter((_texel, index) => clusters[index] === dominant);
  const sum = members.reduce<Vector>(([sumX, sumY, sumZ], [x, y, z]) => [sumX + x, sumY + y, sumZ + z], [0, 0, 0]);
  const linear: Vector = [sum[0] / members.length, sum[1] / members.length, sum[2] / members.length];
  const squaredScatter = members.reduce((total, member) => total + computeSquaredDistance(member, linear), 0);
  return { linear, spread: Math.sqrt(squaredScatter / (members.length * CHANNEL_COUNT)), texelCount: members.length };
};

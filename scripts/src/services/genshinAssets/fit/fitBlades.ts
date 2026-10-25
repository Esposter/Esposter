import type { Vector } from "#src/models/shared/Vector";
import type { StatueStack } from "genshin-engine";

import { clusterVectors } from "#src/services/genshinAssets/fit/clusterVectors";
import { fitStatueStack } from "#src/services/genshinAssets/fit/fitStatueStack";
import { seedClusterMeans } from "#src/services/genshinAssets/fit/seedClusterMeans";
import {
  STATUE_BLADE_ANGLE_COUNT,
  STATUE_BLADE_MIN_SAMPLES,
  STATUE_SECTION_HEIGHT,
} from "#src/services/genshinAssets/shared/constants";

// A component's points split into `count` blades by k-means, each blade a stack along its own length; a blade too few
// Points reach is left out
export const fitBlades = (
  points: readonly Vector[],
  count: number,
  random: () => number,
  readColour: (point: Readonly<Vector>) => number,
): StatueStack[] => {
  const clusters = clusterVectors(points, seedClusterMeans(points, count, random));
  return Array.from({ length: count }, (_blade, blade) =>
    points.filter((_point, index) => clusters[index] === blade),
  ).flatMap((bladePoints) =>
    bladePoints.length < STATUE_BLADE_MIN_SAMPLES
      ? []
      : [
          fitStatueStack(bladePoints, {
            angleCount: STATUE_BLADE_ANGLE_COUNT,
            readColour,
            sectionHeight: STATUE_SECTION_HEIGHT,
          }),
        ],
  );
};

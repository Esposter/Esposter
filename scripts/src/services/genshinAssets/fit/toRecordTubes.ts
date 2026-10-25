import type { TreeTube, TreeTubePoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// A traced mesh's tubes as the record holds them, each point rounded as every fitted value is
export const toRecordTubes = (tubes: readonly TreeTube[]): TreeTubePoint[][] =>
  tubes.map((tube) =>
    tube.map(({ radius, x, y, z }) => ({
      radius: roundFitted(radius),
      x: roundFitted(x),
      y: roundFitted(y),
      z: roundFitted(z),
    })),
  );

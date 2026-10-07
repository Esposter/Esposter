import type { StoneBin } from "#src/models/genshinParity/witness/StoneBin";
import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { Matrix3 } from "three";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { MIN_BIN_COUNT } from "#src/services/genshinParity/witness/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { toSceneColor } from "genshin-engine";
import { Color } from "three";

// The bins a stone solve reads: each part's pixels binned apart from the others', and each bin's colour as the
// Screen shows it averaged first, then taken back through the tone curve once (`toSceneColor`) and the white
// Balance's inverse, since the curve is steep near white and a pixel there taken back alone stands for a scene colour
// Many times its neighbours'. Bins too sparse to read are dropped, and with none left there is nothing to solve
export const groupStoneBins = (samples: readonly StoneLightSample[], whiteBalance: Matrix3): StoneBin[] => {
  const sampleBinMap = Map.groupBy(samples, ({ bin, part }) => `${part}/${bin}`);
  const inverseWhiteBalance = whiteBalance.clone().invert();
  const bins = [...sampleBinMap.values()]
    .filter((binSamples) => binSamples.length >= MIN_BIN_COUNT)
    .map((binSamples) => {
      const displayColor = CHANNELS.map(
        (channel) => binSamples.reduce((sum, { display }) => sum + display[channel], 0) / binSamples.length,
      ) as Vector;
      const { b, g, r } = toSceneColor(new Color(...displayColor)).applyMatrix3(inverseWhiteBalance);
      return { displayColor, samples: binSamples, sceneColor: [r, g, b] satisfies Vector };
    });
  if (bins.length === 0)
    throw new InvalidOperationError(
      Operation.Read,
      "bins",
      `none of ${sampleBinMap.size} holds ${MIN_BIN_COUNT} pixels`,
    );
  return bins;
};

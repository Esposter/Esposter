import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";
import type { SpiralAbyssCycleSave, SpiralAbyssSave } from "#src/models/spiralAbyss/SpiralAbyssSave";

// The Abyss's progress in each cycle, saved under the cycle's key with each chamber by its id
export const toSpiralAbyssSave = (progressMap: ReadonlyMap<string, AbyssProgress>): SpiralAbyssSave =>
  Object.fromEntries(
    Array.from(
      progressMap,
      ([cycleKey, { chamberIdProgressMap, claimedRewardIds }]): [string, SpiralAbyssCycleSave] => [
        cycleKey,
        {
          chambers: Object.fromEntries(
            Array.from(chamberIdProgressMap, ([chamberId, { isCleared, stars }]) => [
              String(chamberId),
              { isCleared, stars },
            ]),
          ),
          claimedRewardIds: [...claimedRewardIds],
        },
      ],
    ),
  );

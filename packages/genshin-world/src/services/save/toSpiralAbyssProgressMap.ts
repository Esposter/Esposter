import type { AbyssChamberProgress } from "#src/models/spiralAbyss/AbyssChamberProgress";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";
import type { SpiralAbyssSave } from "#src/models/spiralAbyss/SpiralAbyssSave";

// The Abyss's progress in each cycle, read back from the save with each chamber's id as a number
export const toSpiralAbyssProgressMap = (save: SpiralAbyssSave): Map<string, AbyssProgress> =>
  new Map(
    Object.entries(save).map(([cycleKey, { chambers, claimedRewardIds }]): [string, AbyssProgress] => [
      cycleKey,
      {
        chamberIdProgressMap: new Map(
          Object.entries(chambers).map(([chamberId, progress]): [number, AbyssChamberProgress] => [
            Number(chamberId),
            progress,
          ]),
        ),
        claimedRewardIds: new Set(claimedRewardIds),
      },
    ]),
  );

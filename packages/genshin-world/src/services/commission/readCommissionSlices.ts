import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { GameDataKey } from "#src/models/data/GameDataKey";

import { readCommissions } from "#src/services/commission/readCommissions";
import { gameDataLock } from "#src/services/data/gameDataLock";

// Whether a lock key is one region's daily tasks
const checkIsCommissionKey = (key: string): key is Extract<GameDataKey, `commissions/${string}`> =>
  key.startsWith("commissions/");

// Every region's daily tasks the game data lock names, each read by its key
export const readCommissionSlices = (gameDataBaseUrl: string): Promise<CommissionSlice[]> =>
  Promise.all(
    Object.keys(gameDataLock.objects).flatMap((key) =>
      checkIsCommissionKey(key) ? [readCommissions(gameDataBaseUrl, key)] : [],
    ),
  );

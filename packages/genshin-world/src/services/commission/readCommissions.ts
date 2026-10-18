import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { GameDataKey } from "#src/models/data/GameDataKey";

import { commissionSliceSchema } from "#src/models/commission/CommissionSlice";
import { readGameData } from "#src/services/data/readGameData";

// The daily tasks of one region `pnpm -C scripts genshin:assets commissions` publishes, fetched by its key from the hosted
// Game data and checked against its shape as it arrives. The key is typed off the lock, so a region no publish wrote fails
// Typecheck
export const readCommissions = (
  gameDataBaseUrl: string,
  key: Extract<GameDataKey, `commissions/${string}`>,
): Promise<CommissionSlice> => readGameData(gameDataBaseUrl, key, commissionSliceSchema);

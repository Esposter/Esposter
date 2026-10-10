import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { commissionSliceSchema } from "#src/models/commission/CommissionSlice";
import { readGameData } from "#src/services/data/readGameData";

// Mondstadt's daily tasks `pnpm -C scripts genshin:assets commissions` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readMondstadtCommissions = (gameDataBaseUrl: string): Promise<CommissionSlice> =>
  readGameData(gameDataBaseUrl, "commissions/mondstadt", commissionSliceSchema);

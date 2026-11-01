import type { FishingStockType } from "#src/models/fishing/FishingStockType";

import { ID_SEPARATOR } from "@esposter/shared";

// The key a stock's catches are held under: its pool's id and the stock's type, so the day's and the night's stocks of one
// Pool are kept apart
export const getFishingStockKey = (poolId: number, stockType: FishingStockType): string =>
  [poolId, stockType].join(ID_SEPARATOR);

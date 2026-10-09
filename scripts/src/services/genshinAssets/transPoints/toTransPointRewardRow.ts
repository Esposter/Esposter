import type { ExcelCurrencyRewardRow } from "#src/models/genshinAssets/transPoints/ExcelCurrencyRewardRow";
import type { ExcelTransPointRewardRow } from "#src/models/genshinAssets/transPoints/ExcelTransPointRewardRow";
import type { TransPointRewardRow } from "#src/models/genshinAssets/transPoints/TransPointRewardRow";

// One transport point's reward from its row and the currencies of the reward row it names
export const toTransPointRewardRow = (
  { pointId }: ExcelTransPointRewardRow,
  { hcoin, playerExp }: ExcelCurrencyRewardRow,
): TransPointRewardRow => ({ adventureExp: playerExp, pointId, primogems: hcoin });

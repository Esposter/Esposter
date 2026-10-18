import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { ResidentWeekGame } from "#src/models/world/Resident";

import { GCG_LUCKY_COIN_ITEM_ID, GCG_PLAYER_EXP_ITEM_ID } from "#src/services/gcg/constants";

// The rewards a week game pays on its first win: the week's Lucky Coins and Player EXP at the level it is offered at
export const toGcgWeekGameRewards = ({ luckyCoins, playerExp }: ResidentWeekGame): ItemCount[] => [
  { count: playerExp, id: GCG_PLAYER_EXP_ITEM_ID },
  { count: luckyCoins, id: GCG_LUCKY_COIN_ITEM_ID },
];

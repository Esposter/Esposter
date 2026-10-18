import type { GcgRewardState } from "#src/models/gcg/GcgRewardState";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GCG_PLAYER_EXP_ITEM_ID } from "#src/services/gcg/constants";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";

// Pays a won game's reward once: its Player EXP into the card game's EXP, and the rest through the bag and wallet the way a
// Reward is granted. A game already paid, and a bag that cannot take the reward whole, leave the state as it is
export const grantGcgGameReward = (
  state: GcgRewardState,
  gameId: number,
  rewards: ItemCount[],
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): GcgRewardState => {
  if (state.rewardedGameIds.includes(gameId)) return state;
  const granted = grantRewardItems(
    state.wallet,
    state.inventory,
    rewards.filter(({ id }) => id !== GCG_PLAYER_EXP_ITEM_ID),
    names,
    materialDataMap,
  );
  if (!granted) return state;
  const playerExp = rewards
    .filter(({ id }) => id === GCG_PLAYER_EXP_ITEM_ID)
    .reduce((total, { count }) => total + count, 0);
  return {
    cardGameExp: state.cardGameExp + playerExp,
    inventory: granted.inventory,
    rewardedGameIds: [...state.rewardedGameIds, gameId].toSorted((firstGame, secondGame) => firstGame - secondGame),
    wallet: granted.wallet,
  };
};

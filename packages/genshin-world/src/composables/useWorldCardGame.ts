import type { WorldCardGameOptions } from "#src/models/gcg/WorldCardGameOptions";

import { grantGcgGameReward } from "#src/services/gcg/grantGcgGameReward";
import { toGcgWeekGameRewards } from "#src/services/gcg/toGcgWeekGameRewards";
import { ref } from "vue";

// The card game's EXP and the games whose one-time reward is paid, which a won week game's duel pays into
export const useWorldCardGame = ({
  getResidents,
  inventory,
  materialDataMap,
  nameText,
  savedCardGameExp,
  savedRewardedGameIds,
  setInventory,
  setWallet,
  wallet,
}: WorldCardGameOptions) => {
  const cardGameExp = ref(savedCardGameExp);
  const cardGameRewardedGameIds = ref(savedRewardedGameIds);
  // A won week game pays its reward once, its Player EXP into the card game's EXP and its Lucky Coins into the bag and wallet,
  // The way a Mail claim pays into them. A duel that is not a week game, or was lost, pays nothing
  const payCardGameReward = (gameId: number | undefined, won: boolean) => {
    const weekGame = getResidents().find((resident) => resident.weekGame?.gameId === gameId)?.weekGame;
    if (!won || !weekGame) return;
    const granted = grantGcgGameReward(
      {
        cardGameExp: cardGameExp.value,
        inventory: inventory.value,
        rewardedGameIds: cardGameRewardedGameIds.value,
        wallet: wallet.value,
      },
      weekGame.gameId,
      toGcgWeekGameRewards(weekGame),
      nameText,
      materialDataMap,
    );
    cardGameExp.value = granted.cardGameExp;
    cardGameRewardedGameIds.value = granted.rewardedGameIds;
    setInventory(granted.inventory);
    setWallet(granted.wallet);
  };
  return { cardGameExp, cardGameRewardedGameIds, payCardGameReward };
};

import type { WorldCardGameOptions } from "#src/models/gcg/WorldCardGameOptions";

import { grantGcgGameReward } from "#src/services/gcg/grantGcgGameReward";
import { toGcgWeekGameRewards } from "#src/services/gcg/toGcgWeekGameRewards";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";
import { ref } from "vue";

// The card game's EXP and the games whose one-time reward is paid, which a won week game's duel pays into
export const useWorldCardGame = ({ getResidents, savedCardGameExp, savedRewardedGameIds }: WorldCardGameOptions) => {
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { setInventory, setWallet } = worldSessionStore;
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
      worldSessionStore.nameText,
      worldSessionStore.materialDataMap,
    );
    cardGameExp.value = granted.cardGameExp;
    cardGameRewardedGameIds.value = granted.rewardedGameIds;
    setInventory(granted.inventory);
    setWallet(granted.wallet);
  };
  return { cardGameExp, cardGameRewardedGameIds, payCardGameReward };
};

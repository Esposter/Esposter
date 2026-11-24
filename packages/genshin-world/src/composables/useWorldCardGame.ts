/* oxlint-disable typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot
   reject and nothing waits on it */
import type { WorldCardGameOptions } from "#src/models/gcg/WorldCardGameOptions";

import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, noop } from "@esposter/shared";
import { storeToRefs } from "pinia";
import { ref } from "vue";

// The card game's EXP and the games whose one-time reward is paid, which a won week game's duel pays into
export const useWorldCardGame = ({ getResidents, savedCardGameExp, savedRewardedGameIds }: WorldCardGameOptions) => {
  const worldSessionStore = useWorldSessionStore();
  const { inventory, wallet } = storeToRefs(worldSessionStore);
  const { setInventory, setWallet } = worldSessionStore;
  const cardGameExp = ref(savedCardGameExp);
  const cardGameRewardedGameIds = ref(savedRewardedGameIds);
  // A won week game pays its reward once, its Player EXP into the card game's EXP and its Lucky Coins into the bag and
  // Wallet, the way a Mail claim pays into them. A duel that is not a week game, or was lost, pays nothing. The
  // Reward's rules are imported as the reward is paid, so the card game stays out of the first screen's static graph
  const payCardGameReward = (gameId: number | undefined, won: boolean) => {
    const weekGame = getResidents().find((resident) => resident.weekGame?.gameId === gameId)?.weekGame;
    if (!won || !weekGame) return;
    getResultAsync(async () => {
      const [{ grantGcgGameReward }, { toGcgWeekGameRewards }] = await Promise.all([
        import("#src/services/gcg/grantGcgGameReward"),
        import("#src/services/gcg/toGcgWeekGameRewards"),
      ]);
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
        worldSessionStore.itemRooms,
      );
      cardGameExp.value = granted.cardGameExp;
      cardGameRewardedGameIds.value = granted.rewardedGameIds;
      setInventory(granted.inventory);
      setWallet(granted.wallet);
    }).match(noop, (error) => {
      console.error(error);
    });
  };
  return { cardGameExp, cardGameRewardedGameIds, payCardGameReward };
};

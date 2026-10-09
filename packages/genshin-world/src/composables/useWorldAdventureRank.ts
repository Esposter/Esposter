import type { Wallet } from "#src/models/inventory/Wallet";
import type { ComputedRef, Ref } from "vue";

import { Currency } from "#src/models/inventory/Currency";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { computed, shallowRef } from "vue";

// The Adventure EXP the session holds live, and the rank and World Level it stands at with the main quests done. A gain
// That passes rank 60 is paid into the wallet as Mora
export const useWorldAdventureRank = ({
  finishedMainQuestIds,
  savedAdventureExp,
  setWallet,
  wallet,
}: {
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  savedAdventureExp: number;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const adventureExp = shallowRef(savedAdventureExp);
  // The ascension quests are named by the string ids the ranks' locks hold
  const completedMainQuestIds = computed(() => new Set(Array.from(finishedMainQuestIds.value, String)));
  const standing = computed(() => computeAdventureRankStanding(adventureExp.value, completedMainQuestIds.value));
  const adventureExpProgress = computed(() => computeAdventureRankProgress(adventureExp.value, standing.value.rank));
  const gainWorldAdventureExp = (amount: number) => {
    const gain = gainAdventureExp(adventureExp.value, amount, completedMainQuestIds.value);
    adventureExp.value = gain.adventureExp;
    if (gain.moraPaid > 0) setWallet({ ...wallet.value, [Currency.Mora]: wallet.value[Currency.Mora] + gain.moraPaid });
  };
  return {
    adventureExp,
    adventureExpProgress,
    gainWorldAdventureExp,
    rank: computed(() => standing.value.rank),
    worldLevel: computed(() => standing.value.worldLevel),
  };
};

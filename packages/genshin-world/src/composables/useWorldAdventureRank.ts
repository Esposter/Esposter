import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ComputedRef, Ref } from "vue";

import { Currency } from "#src/models/inventory/Currency";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { computeWorldLevel } from "#src/services/adventureRank/computeWorldLevel";
import { WORLD_LEVEL_LOWERING_MINIMUM } from "#src/services/adventureRank/constants";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { toggleWorldLevelLowering } from "#src/services/adventureRank/toggleWorldLevelLowering";
import { computed, shallowRef } from "vue";

// The Adventure EXP the session holds live, and the rank and World Level it stands at with the main quests done. A gain
// That passes rank 60 is paid into the wallet as Mora, and the World Level the world plays at is that one less the
// Step the player has lowered it by
export const useWorldAdventureRank = ({
  finishedMainQuestIds,
  savedAdventureExp,
  savedWorldLevelAdjustment,
  setWallet,
  wallet,
}: {
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  savedAdventureExp: number;
  savedWorldLevelAdjustment: WorldLevelAdjustment;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const adventureExp = shallowRef(savedAdventureExp);
  const worldLevelAdjustment = shallowRef(savedWorldLevelAdjustment);
  // The ascension quests are named by the string ids the ranks' locks hold
  const completedMainQuestIds = computed(() => new Set(Array.from(finishedMainQuestIds.value, String)));
  const standing = computed(() => computeAdventureRankStanding(adventureExp.value, completedMainQuestIds.value));
  const unlockedWorldLevel = computed(() => standing.value.worldLevel);
  const adventureExpProgress = computed(() => computeAdventureRankProgress(adventureExp.value, standing.value.rank));
  // The World Level can be lowered from the unlocked minimum, and a lowered one restored whatever it stands at
  const isWorldLevelAdjustable = computed(
    () => unlockedWorldLevel.value >= WORLD_LEVEL_LOWERING_MINIMUM || worldLevelAdjustment.value.isLowered,
  );
  const toggleWorldLevel = () => {
    worldLevelAdjustment.value = toggleWorldLevelLowering(
      worldLevelAdjustment.value,
      unlockedWorldLevel.value,
      Temporal.Now.instant(),
    );
  };
  const gainWorldAdventureExp = (amount: number) => {
    const gain = gainAdventureExp(adventureExp.value, amount, completedMainQuestIds.value);
    adventureExp.value = gain.adventureExp;
    if (gain.moraPaid > 0) setWallet({ ...wallet.value, [Currency.Mora]: wallet.value[Currency.Mora] + gain.moraPaid });
  };
  return {
    adventureExp,
    adventureExpProgress,
    gainWorldAdventureExp,
    isWorldLevelAdjustable,
    rank: computed(() => standing.value.rank),
    toggleWorldLevel,
    worldLevel: computed(() => computeWorldLevel(unlockedWorldLevel.value, worldLevelAdjustment.value)),
    worldLevelAdjustment,
  };
};

import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { ComputedRef, Ref } from "vue";

import { Currency } from "#src/models/inventory/Currency";
import { claimRankRewards } from "#src/services/adventureRank/claimRankRewards";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { computeWorldLevel } from "#src/services/adventureRank/computeWorldLevel";
import { WORLD_LEVEL_LOWERING_MINIMUM } from "#src/services/adventureRank/constants";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { toggleWorldLevelLowering } from "#src/services/adventureRank/toggleWorldLevelLowering";
import { computed, shallowRef, watch } from "vue";

// The Adventure EXP the session holds live, and the rank and World Level it stands at with the main quests done. A gain
// That passes rank 60 is paid into the wallet as Mora, and the World Level the world plays at is that one less the
// Step the player has lowered it by
export const useWorldAdventureRank = ({
  adventureRankTables,
  events,
  finishedMainQuestIds,
  getWorldNow,
  savedAdventureExp,
  savedAdventureRankRewardsClaimed,
  savedWorldLevelAdjustment,
  setWallet,
  wallet,
}: {
  adventureRankTables: AdventureRankTables;
  events: WorldEvents;
  finishedMainQuestIds: ComputedRef<ReadonlySet<number>>;
  getWorldNow: () => Temporal.Instant;
  savedAdventureExp: number;
  savedAdventureRankRewardsClaimed: number[];
  savedWorldLevelAdjustment: WorldLevelAdjustment;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const adventureExp = shallowRef(savedAdventureExp);
  const worldLevelAdjustment = shallowRef(savedWorldLevelAdjustment);
  const claimedRanks = shallowRef(savedAdventureRankRewardsClaimed);
  // The ascension quests are named by the string ids the ranks' locks hold
  const completedMainQuestIds = computed(() => new Set(Array.from(finishedMainQuestIds.value, String)));
  const standing = computed(() =>
    computeAdventureRankStanding(adventureRankTables, adventureExp.value, completedMainQuestIds.value),
  );
  const unlockedWorldLevel = computed(() => standing.value.worldLevel);
  // Every World Level the unlocked one passes raises its event, so a step past several levels at once raises each of them
  watch(unlockedWorldLevel, (newWorldLevel, previousWorldLevel) => {
    for (let worldLevel = previousWorldLevel + 1; worldLevel <= newWorldLevel; worldLevel++)
      events.emit("worldLevelUp", worldLevel);
  });
  const adventureExpProgress = computed(() =>
    computeAdventureRankProgress(adventureRankTables, adventureExp.value, standing.value.rank),
  );
  // The World Level can be lowered from the unlocked minimum, and a lowered one restored whatever it stands at
  const isWorldLevelAdjustable = computed(
    () => unlockedWorldLevel.value >= WORLD_LEVEL_LOWERING_MINIMUM || worldLevelAdjustment.value.isLowered,
  );
  const toggleWorldLevel = () => {
    worldLevelAdjustment.value = toggleWorldLevelLowering(
      worldLevelAdjustment.value,
      unlockedWorldLevel.value,
      getWorldNow(),
    );
  };
  const gainWorldAdventureExp = (amount: number) => {
    const gain = gainAdventureExp(adventureRankTables, adventureExp.value, amount, completedMainQuestIds.value);
    adventureExp.value = gain.adventureExp;
    if (gain.moraPaid > 0) setWallet({ ...wallet.value, [Currency.Mora]: wallet.value[Currency.Mora] + gain.moraPaid });
  };
  // Katheryne gives each reached rank's reward once, and the ranks given are kept with the save, so a reload gives
  // None again
  const claimKatheryneRewards = () => {
    const claim = claimRankRewards(adventureRankTables.levels, standing.value.rank, claimedRanks.value);
    claimedRanks.value = claim.claimedRanks;
    return claim.rewards;
  };
  return {
    adventureExp,
    adventureExpProgress,
    adventureRankRewardsClaimed: claimedRanks,
    claimKatheryneRewards,
    completedMainQuestIds,
    gainWorldAdventureExp,
    isWorldLevelAdjustable,
    rank: computed(() => standing.value.rank),
    toggleWorldLevel,
    worldLevel: computed(() => computeWorldLevel(unlockedWorldLevel.value, worldLevelAdjustment.value)),
    worldLevelAdjustment,
  };
};

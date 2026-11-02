import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";

import { Currency } from "#src/models/inventory/Currency";
import { claimRankRewards } from "#src/services/adventureRank/claimRankRewards";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { computeWorldLevel } from "#src/services/adventureRank/computeWorldLevel";
import { WORLD_LEVEL_LOWERING_MINIMUM } from "#src/services/adventureRank/constants";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { toggleWorldLevelLowering } from "#src/services/adventureRank/toggleWorldLevelLowering";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldSessionStore } from "#src/store/session";
import { NotInitializedError } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, shallowRef, watch } from "vue";

// The Adventure EXP the session holds live, and the rank and World Level it stands at with the main quests done. A gain
// That passes rank 60 is paid into the wallet as Mora, and the World Level the world plays at is that one less the
// Step the player has lowered it by
export const useWorldAdventureRankStore = defineStore("world/adventureRank", () => {
  const worldSessionStore = useWorldSessionStore();
  const worldQuestsStore = useWorldQuestsStore();
  const { events, getWorldNow, setWallet } = worldSessionStore;
  const tables = shallowRef<AdventureRankTables>();
  const adventureExp = shallowRef(0);
  const worldLevelAdjustment = shallowRef<WorldLevelAdjustment>({ isLowered: false });
  const claimedRanks = shallowRef<number[]>([]);
  const getTables = () => {
    if (!tables.value) throw new NotInitializedError("WorldAdventureRankStore");
    return tables.value;
  };
  // The ascension quests are named by the string ids the ranks' locks hold
  const completedMainQuestIds = computed(() => new Set(Array.from(worldQuestsStore.finishedMainQuestIds, String)));
  const standing = computed(() =>
    computeAdventureRankStanding(getTables(), adventureExp.value, completedMainQuestIds.value),
  );
  // None until the store starts, so the first World Level it reaches is not a level gained
  const unlockedWorldLevel = computed(() => (tables.value ? standing.value.worldLevel : 0));
  // Every World Level the unlocked one passes raises its event, so a step past several levels at once raises each of them
  watch(unlockedWorldLevel, (newWorldLevel, previousWorldLevel) => {
    if (previousWorldLevel === 0) return;
    for (let worldLevel = previousWorldLevel + 1; worldLevel <= newWorldLevel; worldLevel++)
      events.emit("worldLevelUp", worldLevel);
  });
  const adventureExpProgress = computed(() =>
    computeAdventureRankProgress(getTables(), adventureExp.value, standing.value.rank),
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
    const gain = gainAdventureExp(getTables(), adventureExp.value, amount, completedMainQuestIds.value);
    adventureExp.value = gain.adventureExp;
    if (gain.moraPaid > 0)
      setWallet({
        ...worldSessionStore.wallet,
        [Currency.Mora]: worldSessionStore.wallet[Currency.Mora] + gain.moraPaid,
      });
  };
  // Katheryne gives each reached rank's reward once, and the ranks given are kept with the save, so a reload gives
  // None again
  const claimKatheryneRewards = () => {
    const claim = claimRankRewards(getTables().levels, standing.value.rank, claimedRanks.value);
    claimedRanks.value = claim.claimedRanks;
    return claim.rewards;
  };
  const start = (
    adventureRankTables: AdventureRankTables,
    saved: { adventureExp: number; adventureRankRewardsClaimed: number[]; worldLevelAdjustment: WorldLevelAdjustment },
  ) => {
    tables.value = adventureRankTables;
    adventureExp.value = saved.adventureExp;
    claimedRanks.value = saved.adventureRankRewardsClaimed;
    worldLevelAdjustment.value = saved.worldLevelAdjustment;
  };
  const stop = () => {
    tables.value = undefined;
    adventureExp.value = 0;
    claimedRanks.value = [];
    worldLevelAdjustment.value = { isLowered: false };
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
    start,
    stop,
    toggleWorldLevel,
    worldLevel: computed(() => computeWorldLevel(unlockedWorldLevel.value, worldLevelAdjustment.value)),
    worldLevelAdjustment,
  };
});

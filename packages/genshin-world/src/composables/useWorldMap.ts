import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Ref } from "vue";

import { useExplorationAreas } from "#src/composables/useExplorationAreas";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { computeNationExplorationPercentage } from "#src/services/exploration/computeNationExplorationPercentage";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { addReputationExp } from "#src/services/reputation/addReputationExp";
import { computeReputationExploresReached } from "#src/services/reputation/computeReputationExploresReached";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// The landmarks the world holds and the ones the player has unlocked, the first unlock of each paid, and the pose a jump
// Lands at. A landmark is unlocked by resonating with it, and each is paid once
export const useWorldMap = ({
  catalogue,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  regionDataBaseUrl,
  reputation,
  setReputation,
  setWallet,
  unlockedLandmarkIds: savedUnlockedLandmarkIds,
  wallet,
}: {
  catalogue: Catalogue;
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  regionDataBaseUrl: string;
  reputation: Ref<ReputationProgress>;
  setReputation: (nextReputation: ReputationProgress) => void;
  setWallet: (nextWallet: Wallet) => void;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Ref<Wallet>;
}) => {
  // Every landmark a jump lands at, and the ones the player has unlocked: the map, the minimap, the jump list and a revive
  // Offer only those. A new player has unlocked none, and each is unlocked by resonating with it
  const jumpLandmarks = useJumpLandmarks(regionDataBaseUrl, catalogue);
  // The areas the map counts the exploration of, read as the world opens and shown on each area the unlocked statues fill
  const explorationAreas = useExplorationAreas(gameDataBaseUrl);
  // Mondstadt's Reputation, read as the world opens: its levels, and the exploration thresholds a statue's unlock can pass
  const mondstadtReputation = shallowRef<ReputationCity>();
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readMondstadtReputation(gameDataBaseUrl)).match(
    (reputationCity) => {
      mondstadtReputation.value = reputationCity;
    },
    (error) => {
      console.error(error);
    },
  );
  const unlockedLandmarkIds = shallowRef<ReadonlySet<string>>(savedUnlockedLandmarkIds);
  const unlockedLandmarks = computed(() => jumpLandmarks.value.filter(({ id }) => unlockedLandmarkIds.value.has(id)));

  // The Primogems and Adventure EXP a statue pays on its first unlock, from the open world's transport points by its scene
  // Point. Only a locked landmark is offered to resonate with, so each is paid once
  const payFirstUnlockReward = (landmarkId: string) => {
    const pointId = LandmarkIdStatuePointIdMap[landmarkId];
    if (pointId === undefined) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readOpenWorldTransPointRewards(gameDataBaseUrl)).match(
      (rewards) => {
        const reward = rewards.find((transPointReward) => transPointReward.pointId === pointId);
        if (!reward) return;
        setWallet({ ...wallet.value, [Currency.Primogem]: wallet.value[Currency.Primogem] + reward.primogems });
        gainWorldAdventureExp(reward.adventureExp);
      },
      (error) => {
        console.error(error);
      },
    );
  };
  // Each exploration threshold this unlock carries the nation's percentage past pays its Reputation EXP and wallet items
  // Once, and a threshold the percentage already held pays nothing. Nothing is paid until the areas and Reputation are read
  const payReputationExplores = (previousPercentage: number) => {
    if (!mondstadtReputation.value || explorationAreas.value.length === 0) return;
    const { explores, levels } = mondstadtReputation.value;
    const percentage = computeNationExplorationPercentage(explorationAreas.value, unlockedLandmarks.value);
    for (const { reward } of computeReputationExploresReached(previousPercentage, percentage, explores)) {
      setReputation(addReputationExp(reputation.value, reward.exp, levels));
      const nextWallet = { ...wallet.value };
      for (const { count, id } of reward.items) {
        const currency = getWalletCurrency(id);
        if (currency === undefined) throw new InvalidOperationError(Operation.Update, "reputation reward", String(id));
        nextWallet[currency] += count;
      }
      setWallet(nextWallet);
    }
  };
  // A landmark the player activates is unlocked, its first unlock paid, and the world told it was interacted with
  const activateLandmark = (landmarkId: string) => {
    const previousPercentage = computeNationExplorationPercentage(explorationAreas.value, unlockedLandmarks.value);
    unlockedLandmarkIds.value = new Set([...unlockedLandmarkIds.value, landmarkId]);
    payFirstUnlockReward(landmarkId);
    payReputationExplores(previousPercentage);
    events.emit("questEvent", { kind: QuestObjectiveKind.Interact, targetId: landmarkId });
  };

  // A jump's pose while the screen is faded for it: set, the screen fades to black, and once that fade ends the character
  // Is placed and the pose let go, so the screen fades back in
  const jumpPose = shallowRef<WorldJumpPose>();
  const jumpTo = (pose: WorldJumpPose) => {
    jumpPose.value = pose;
  };
  return {
    activateLandmark,
    explorationAreas,
    jumpLandmarks,
    jumpPose,
    jumpTo,
    unlockedLandmarkIds,
    unlockedLandmarks,
  };
};

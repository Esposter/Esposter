import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Ref } from "vue";

import { useExplorationAreas } from "#src/composables/useExplorationAreas";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { computeNationExplorationPercentage } from "#src/services/exploration/computeNationExplorationPercentage";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { addReputationExp } from "#src/services/reputation/addReputationExp";
import { computeReputationExploresReached } from "#src/services/reputation/computeReputationExploresReached";
import { getFinishedReputationRewards } from "#src/services/reputation/getFinishedReputationRewards";
import { getReputationRequestBindings } from "#src/services/reputation/getReputationRequestBindings";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { computeLandmarkPointId } from "#src/services/transPoint/computeLandmarkPointId";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { computed, shallowRef, watch } from "vue";

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
  const {
    domainEntranceLandmarks,
    isLoaded: isJumpLandmarksLoaded,
    jumpLandmarks,
  } = useJumpLandmarks(regionDataBaseUrl, catalogue);
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
  // The jump landmarks the player has yet to unlock, which the prompt list offers to resonate with and the HUD points to
  const lockedJumpLandmarks = computed(() =>
    jumpLandmarks.value.filter(({ id }) => !unlockedLandmarkIds.value.has(id)),
  );
  // The domain entrances the player has yet to unlock, which the prompt list offers to resonate with, as it does a waypoint
  const lockedDomainEntranceLandmarks = computed(() =>
    domainEntranceLandmarks.value.filter(({ id }) => !unlockedLandmarkIds.value.has(id)),
  );

  // The Primogems and Adventure EXP a statue or a waypoint pays on its first unlock, from the open world's transport points
  // By its scene point. A domain entrance has no point, so pays nothing
  const payFirstUnlockReward = (landmarkId: string) => {
    const pointId = computeLandmarkPointId(landmarkId);
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
  // The unlocked landmarks whose exploration thresholds are paid: the saved ones, which paid when they were unlocked, and
  // The ones the settle below has counted. An unlock made before every read has landed waits outside this set
  let thresholdPaidLandmarkIds: ReadonlySet<string> = savedUnlockedLandmarkIds;
  // Each exploration threshold the nation's percentage passes since the last settle pays its Reputation EXP and wallet
  // Items once, and a threshold the percentage already held pays nothing. Nothing settles until the areas, the Reputation
  // And every region are in, so the percentage before the unlocks is the one the saved landmarks reach
  // A Reputation reward pays its EXP at the nation's levels and its items into the wallet, the one payment both the
  // Exploration thresholds and the finished requests make
  const payReputationReward = ({ exp, items }: ReputationReward) => {
    if (!mondstadtReputation.value) return;
    setReputation(addReputationExp(reputation.value, exp, mondstadtReputation.value.levels));
    const nextWallet = { ...wallet.value };
    for (const { count, id } of items) {
      const currency = getWalletCurrency(id);
      if (currency === undefined) throw new InvalidOperationError(Operation.Update, "reputation reward", String(id));
      nextWallet[currency] += count;
    }
    setWallet(nextWallet);
  };
  const settleExplorationThresholds = () => {
    if (!mondstadtReputation.value || explorationAreas.value.length === 0 || !isJumpLandmarksLoaded.value) return;
    const { explores } = mondstadtReputation.value;
    const previousPercentage = computeNationExplorationPercentage(
      explorationAreas.value,
      jumpLandmarks.value.filter(({ id }) => thresholdPaidLandmarkIds.has(id)),
    );
    const percentage = computeNationExplorationPercentage(explorationAreas.value, unlockedLandmarks.value);
    thresholdPaidLandmarkIds = unlockedLandmarkIds.value;
    for (const { reward } of computeReputationExploresReached(previousPercentage, percentage, explores))
      payReputationReward(reward);
  };
  // The areas, the Reputation and the regions are read in the background, so the thresholds settle once all of them are in
  watch([mondstadtReputation, explorationAreas, isJumpLandmarksLoaded], settleExplorationThresholds);
  // A finished quest pays the Reputation request it is, once: the event is emitted on the move that finishes it, and each
  // Request binds its quest once, so a quest the groups repeat pays its first row's reward. A quest finished before the
  // Reputation has loaded is paid once it has, as the event is not emitted again
  let unpaidQuestFinishes: ((requests: ReputationCity["requests"]) => void)[] = [];
  events.on("finishQuest", (quest, progress, nextProgress) => {
    const payQuestFinish = (requests: ReputationCity["requests"]) => {
      for (const reward of getFinishedReputationRewards(
        quest,
        progress,
        nextProgress,
        getReputationRequestBindings(requests),
      ))
        payReputationReward(reward);
    };
    if (mondstadtReputation.value) payQuestFinish(mondstadtReputation.value.requests);
    else unpaidQuestFinishes.push(payQuestFinish);
  });
  watch(mondstadtReputation, (reputationCity) => {
    if (!reputationCity) return;
    const pendingQuestFinishes = unpaidQuestFinishes;
    unpaidQuestFinishes = [];
    for (const payQuestFinish of pendingQuestFinishes) payQuestFinish(reputationCity.requests);
  });
  // A landmark the player activates is unlocked, its first unlock paid, and the world told it was interacted with, by its
  // Id and by its scene point, which the quest step that names a waypoint by its point finishes on
  const activateLandmark = (landmarkId: string) => {
    const isFirstUnlock = !unlockedLandmarkIds.value.has(landmarkId);
    unlockedLandmarkIds.value = new Set([...unlockedLandmarkIds.value, landmarkId]);
    if (isFirstUnlock) payFirstUnlockReward(landmarkId);
    settleExplorationThresholds();
    events.emit("questEvent", { kind: QuestObjectiveKind.Interact, targetId: landmarkId });
    const transPointId = computeLandmarkPointId(landmarkId);
    if (transPointId !== undefined)
      events.emit("questEvent", { kind: QuestObjectiveKind.Interact, targetId: String(transPointId) });
    const pointId = LandmarkIdStatuePointIdMap[landmarkId];
    if (pointId !== undefined)
      events.emit("achievementEvents", [
        { kind: AchievementEventKind.TransPointUnlocked, quantity: 1, targetId: String(pointId) },
      ]);
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
    lockedDomainEntranceLandmarks,
    lockedJumpLandmarks,
    unlockedLandmarkIds,
    unlockedLandmarks,
  };
};

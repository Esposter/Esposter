import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";
import type { TransPointUnlock } from "#src/models/transPoint/TransPointUnlock";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { PlacedDoing } from "#src/services/exploration/placeExplorationDoings";
import type { Ref } from "vue";

import { useExplorationAreas } from "#src/composables/useExplorationAreas";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { computeNationExplorationPercentage } from "#src/services/exploration/computeNationExplorationPercentage";
import { placeExplorationDoings } from "#src/services/exploration/placeExplorationDoings";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { checkIsWeeklyBossEntrance } from "#src/services/map/checkIsWeeklyBossEntrance";
import { computeUnlockedJumpLandmarks } from "#src/services/map/computeUnlockedJumpLandmarks";
import { addReputationExp } from "#src/services/reputation/addReputationExp";
import { addWeeklyReputationClaim } from "#src/services/reputation/addWeeklyReputationClaim";
import { computeReputationExploresReached } from "#src/services/reputation/computeReputationExploresReached";
import { getFinishedReputationRewards } from "#src/services/reputation/getFinishedReputationRewards";
import { getReputationRequestBindings } from "#src/services/reputation/getReputationRequestBindings";
import { readMondstadtReputation } from "#src/services/reputation/readMondstadtReputation";
import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { computeHiddenTransPointIds } from "#src/services/transPoint/computeHiddenTransPointIds";
import { computeLandmarkPointId } from "#src/services/transPoint/computeLandmarkPointId";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { readOpenWorldTransPointUnlocks } from "#src/services/transPoint/readOpenWorldTransPointUnlocks";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { computed, shallowRef, watch } from "vue";

// The landmarks the world holds and the ones the player has unlocked, the first unlock of each paid, and the pose a jump
// Lands at. A landmark is unlocked by resonating with it, and each is paid once. The doings the save records count toward
// The exploration the map shows and the thresholds pay on, against the placed doings each area holds
export const useWorldMap = ({
  catalogue,
  completedMainQuestIds,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  placedDoings,
  questStepTargets,
  recordedDoingIds,
  regionDataBaseUrl,
  reputation,
  savedRequestClaimedAts,
  setReputation,
  setWallet,
  unlockedLandmarkIds: savedUnlockedLandmarkIds,
  wallet,
}: {
  catalogue: Catalogue;
  // The main quests the player has done, which open a weekly boss's Trounce Domain entrance
  completedMainQuestIds: Readonly<Ref<ReadonlySet<string>>>;
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  // The placed doings the world holds, each a chest, an Oculus, a puzzle or a camp, by the point it stands at
  placedDoings: Readonly<Ref<PlacedDoing[]>>;
  questStepTargets: Readonly<Ref<{ named: ReadonlySet<string>; reached: ReadonlySet<string> }>>;
  // The doings the save records as done, by id, which count toward their areas whatever the statues have unlocked
  recordedDoingIds: Readonly<Ref<ReadonlySet<string>>>;
  regionDataBaseUrl: string;
  reputation: Ref<ReputationProgress>;
  // The request claims the week holds, each request's payment counted against the week's limit of requests
  savedRequestClaimedAts: readonly Temporal.Instant[];
  setReputation: (nextReputation: ReputationProgress) => void;
  setWallet: (nextWallet: Wallet) => void;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Ref<Wallet>;
}) => {
  // Every landmark a jump lands at, and the ones the player has unlocked: the map, the minimap, the jump list and a revive
  // Offer only those. A new player has unlocked none, and each is unlocked by resonating with it
  const { isLoaded: isJumpLandmarksLoaded, jumpLandmarks } = useJumpLandmarks(regionDataBaseUrl, catalogue);
  // The areas the map counts the exploration of, read as the world opens, each with the placed doings that stand in it
  const explorationAreas = useExplorationAreas(gameDataBaseUrl);
  const placedExplorationAreas = computed(() =>
    placeExplorationDoings(explorationAreas.value, catalogue, placedDoings.value),
  );
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
  // The transport points the open world's unlock table lists, read as the world opens. One a quest step names stays hidden
  // From the map and the prompt list until that step is reached
  const transPointUnlocks = shallowRef<TransPointUnlock[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readOpenWorldTransPointUnlocks(gameDataBaseUrl)).match(
    (unlocks) => {
      transPointUnlocks.value = unlocks;
    },
    (error) => {
      console.error(error);
    },
  );
  const hiddenTransPointIds = computed(() =>
    computeHiddenTransPointIds(
      transPointUnlocks.value.map(({ pointId }) => pointId),
      questStepTargets.value.named,
      questStepTargets.value.reached,
    ),
  );
  const unlockedLandmarkIds = shallowRef<ReadonlySet<string>>(savedUnlockedLandmarkIds);
  const unlockedLandmarks = computed(() =>
    computeUnlockedJumpLandmarks(jumpLandmarks.value, unlockedLandmarkIds.value, completedMainQuestIds.value),
  );
  // The jump landmarks the player has yet to unlock, which the prompt list offers to resonate with and the HUD points to.
  // A domain entrance is one of them, as a statue or a waypoint is. A waypoint the game hides until its step is left out
  // Of them
  const lockedJumpLandmarks = computed(() =>
    jumpLandmarks.value.filter((landmark) => {
      // A weekly boss's entrance opens by its quests, so there is nothing to resonate with
      if (checkIsWeeklyBossEntrance(landmark) || unlockedLandmarkIds.value.has(landmark.id)) return false;
      const pointId = computeLandmarkPointId(landmark.id);
      return pointId === undefined || !hiddenTransPointIds.value.has(pointId);
    }),
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
  // The unlocked landmarks and the recorded doings whose exploration thresholds are paid: the saved ones, which paid when
  // They were made, and the ones the settle below has counted. An unlock or a doing made before every read has landed
  // Waits outside these sets
  let thresholdPaidLandmarkIds: ReadonlySet<string> = savedUnlockedLandmarkIds;
  let thresholdPaidDoingIds: ReadonlySet<string> = recordedDoingIds.value;
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
    if (!mondstadtReputation.value || placedExplorationAreas.value.length === 0 || !isJumpLandmarksLoaded.value) return;
    const { explores } = mondstadtReputation.value;
    const previousPercentage = computeNationExplorationPercentage(
      placedExplorationAreas.value,
      jumpLandmarks.value.filter(({ id }) => thresholdPaidLandmarkIds.has(id)),
      thresholdPaidDoingIds,
    );
    const percentage = computeNationExplorationPercentage(
      placedExplorationAreas.value,
      unlockedLandmarks.value,
      recordedDoingIds.value,
    );
    thresholdPaidLandmarkIds = unlockedLandmarkIds.value;
    thresholdPaidDoingIds = recordedDoingIds.value;
    for (const { reward } of computeReputationExploresReached(previousPercentage, percentage, explores))
      payReputationReward(reward);
  };
  // The areas, the Reputation and the regions are read in the background, so the thresholds settle once all of them are
  // In, and again as a doing is recorded or a placed doing is found
  watch(
    [mondstadtReputation, placedExplorationAreas, isJumpLandmarksLoaded, recordedDoingIds],
    settleExplorationThresholds,
  );
  // A request's reward pays only while the week's request claims have room, and is withheld until the reset once they are
  // Used up. The claim is counted only when its reward pays
  const requestClaimedAts = shallowRef<readonly Temporal.Instant[]>(savedRequestClaimedAts);
  const payRequestReward = (reward: ReputationReward) => {
    const nextClaimedAts = addWeeklyReputationClaim(requestClaimedAts.value, Temporal.Now.instant());
    if (!nextClaimedAts) return;
    requestClaimedAts.value = nextClaimedAts;
    payReputationReward(reward);
  };
  // A finished quest pays the Reputation request or Reputation quest it is, once: the event is emitted on the move
  // That finishes it, and each request binds its quest once, so a quest the groups repeat pays its first row's
  // Reward. A quest finished before the Reputation has loaded is paid once it has, as the event is not emitted again
  let unpaidQuestFinishes: ((reputationCity: ReputationCity) => void)[] = [];
  events.on("finishQuest", (quest, progress, nextProgress) => {
    const payQuestFinish = (reputationCity: ReputationCity) => {
      for (const reward of getFinishedReputationRewards(quest, progress, nextProgress, reputationCity.quests))
        payReputationReward(reward);
      const requestBindings = getReputationRequestBindings(reputationCity.requests);
      for (const reward of getFinishedReputationRewards(quest, progress, nextProgress, requestBindings))
        payRequestReward(reward);
    };
    if (mondstadtReputation.value) payQuestFinish(mondstadtReputation.value);
    else unpaidQuestFinishes.push(payQuestFinish);
  });
  watch(mondstadtReputation, (reputationCity) => {
    if (!reputationCity) return;
    const pendingQuestFinishes = unpaidQuestFinishes;
    unpaidQuestFinishes = [];
    for (const payQuestFinish of pendingQuestFinishes) payQuestFinish(reputationCity);
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
    events.emit("teleport", pose);
  };
  return {
    activateLandmark,
    explorationAreas: placedExplorationAreas,
    jumpLandmarks,
    jumpPose,
    jumpTo,
    lockedJumpLandmarks,
    payReputationReward,
    requestClaimedAts,
    unlockedLandmarkIds,
    unlockedLandmarks,
  };
};

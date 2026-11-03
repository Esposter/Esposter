import type { MapSubareaLabel } from "#src/models/map/MapSubareaLabel";
import type { TransPointUnlock } from "#src/models/transPoint/TransPointUnlock";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { checkIsWeeklyBossEntrance } from "#src/services/map/checkIsWeeklyBossEntrance";
import { computeUnlockedJumpLandmarks } from "#src/services/map/computeUnlockedJumpLandmarks";
import { JUMP_LANDMARK_KINDS } from "#src/services/map/constants";
import { readMapSubareaLabels } from "#src/services/map/readMapSubareaLabels";
import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { computeHiddenTransPointIds } from "#src/services/transPoint/computeHiddenTransPointIds";
import { computeLandmarkPointId } from "#src/services/transPoint/computeLandmarkPointId";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { readOpenWorldTransPointUnlocks } from "#src/services/transPoint/readOpenWorldTransPointUnlocks";
import { readRegionData } from "#src/services/world/readRegionData";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldQuestsStore } from "#src/store/quests";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";

// The landmarks the world holds and the ones the player has unlocked, the first unlock of each paid, and the pose a jump
// Lands at. A landmark is unlocked by resonating with it, and each is paid once. The session starts it after the quests
// And the adventure rank and stops it as it unmounts
export const useWorldMapStore = defineStore("world/map", () => {
  const worldSessionStore = useWorldSessionStore();
  const worldQuestsStore = useWorldQuestsStore();
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { events, setWallet } = worldSessionStore;
  // Every landmark a jump lands at across the whole catalogue rather than the regions in reach, since the map shows the
  // Whole continent: each region's data is read once, and a region that fails is logged and left off. The list is
  // Complete once every region has settled, read or failed, so isJumpLandmarksLoaded is the point a landmark can be
  // Counted in full. A domain entrance is a jump landmark like a statue or a waypoint, listed once the player has
  // Unlocked it. The map, the minimap, the jump list and a revive offer only the unlocked ones
  const jumpLandmarks = shallowRef<Landmark[]>([]);
  const unsettledRegionCount = shallowRef<number>();
  const isJumpLandmarksLoaded = computed(() => unsettledRegionCount.value === 0);
  // The subarea labels the open world publishes, each named by its text id in the world's names
  const subareaLabels = shallowRef<MapSubareaLabel[]>([]);
  // The transport points the open world's unlock table lists. One a quest step names stays hidden from the map and the
  // Prompt list until that step is reached
  const transPointUnlocks = shallowRef<TransPointUnlock[]>([]);
  const hiddenTransPointIds = computed(() =>
    computeHiddenTransPointIds(
      transPointUnlocks.value.map(({ pointId }) => pointId),
      worldQuestsStore.questStepTargets.named,
      worldQuestsStore.questStepTargets.reached,
    ),
  );
  const unlockedLandmarkIds = shallowRef<ReadonlySet<string>>(new Set());
  const unlockedLandmarks = computed(() =>
    computeUnlockedJumpLandmarks(
      jumpLandmarks.value,
      unlockedLandmarkIds.value,
      worldAdventureRankStore.completedMainQuestIds,
    ),
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
  // A jump's pose while the screen is faded for it: set, the screen fades to black, and once that fade ends the character
  // Is placed and the pose let go, so the screen fades back in
  const jumpPose = shallowRef<WorldJumpPose>();

  // Each start and stop begins a new generation, so a read the last session began settles into nothing once the world has
  // Stopped or restarted, rather than into the session that replaced it
  let generation = 0;
  const start = (catalogue: Catalogue, regionDataBaseUrl: string, savedUnlockedLandmarkIds: ReadonlySet<string>) => {
    const startedGeneration = ++generation;
    unlockedLandmarkIds.value = savedUnlockedLandmarkIds;
    unsettledRegionCount.value = catalogue.regions.length;
    const readRegion = (id: string) => {
      getSynchronizedFunction(() =>
        getResultAsync(() => readRegionData(regionDataBaseUrl, id)).match(
          ({ landmarks }) => {
            if (startedGeneration !== generation) return;
            jumpLandmarks.value = [
              ...jumpLandmarks.value,
              ...landmarks.filter(({ kind }) => JUMP_LANDMARK_KINDS.includes(kind)),
            ];
            unsettledRegionCount.value = (unsettledRegionCount.value ?? 0) - 1;
          },
          (error) => {
            console.error(error);
            if (startedGeneration !== generation) return;
            unsettledRegionCount.value = (unsettledRegionCount.value ?? 0) - 1;
          },
        ),
      )();
    };
    for (const { id } of catalogue.regions) readRegion(id);
    getSynchronizedFunction(() =>
      getResultAsync(() => readMapSubareaLabels(worldSessionStore.gameDataBaseUrl)).match(
        (labels) => {
          if (startedGeneration === generation) subareaLabels.value = labels;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
    getSynchronizedFunction(() =>
      getResultAsync(() => readOpenWorldTransPointUnlocks(worldSessionStore.gameDataBaseUrl)).match(
        (unlocks) => {
          if (startedGeneration === generation) transPointUnlocks.value = unlocks;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
  };
  const stop = () => {
    generation++;
    jumpLandmarks.value = [];
    unsettledRegionCount.value = undefined;
    subareaLabels.value = [];
    transPointUnlocks.value = [];
    unlockedLandmarkIds.value = new Set();
    jumpPose.value = undefined;
  };
  // The Primogems and Adventure EXP a statue or a waypoint pays on its first unlock, from the open world's transport points
  // By its scene point. A domain entrance has no point, so pays nothing
  const payFirstUnlockReward = getSynchronizedFunction(async (landmarkId: string) => {
    const pointId = computeLandmarkPointId(landmarkId);
    if (pointId === undefined) return;
    await getResultAsync(() => readOpenWorldTransPointRewards(worldSessionStore.gameDataBaseUrl)).match(
      (rewards) => {
        const reward = rewards.find((transPointReward) => transPointReward.pointId === pointId);
        if (!reward) return;
        setWallet({
          ...worldSessionStore.wallet,
          [Currency.Primogem]: worldSessionStore.wallet[Currency.Primogem] + reward.primogems,
        });
        worldAdventureRankStore.gainWorldAdventureExp(reward.adventureExp);
      },
      (error) => {
        console.error(error);
      },
    );
  });
  // A landmark the player activates is unlocked, its first unlock paid, and the world told it was interacted with, by its
  // Id and by its scene point, which the quest step that names a waypoint by its point finishes on
  const activateLandmark = (landmarkId: string) => {
    const isFirstUnlock = !unlockedLandmarkIds.value.has(landmarkId);
    unlockedLandmarkIds.value = new Set([...unlockedLandmarkIds.value, landmarkId]);
    if (isFirstUnlock) payFirstUnlockReward(landmarkId);
    const landmark = jumpLandmarks.value.find(({ id }) => id === landmarkId);
    if (isFirstUnlock && landmark?.kind === LandmarkKind.DomainEntrance)
      events.emit("domainEntryUnlocked", landmark.entryId);
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
  const jumpTo = (pose: WorldJumpPose) => {
    jumpPose.value = pose;
    events.emit("teleport", pose);
  };

  return {
    activateLandmark,
    isJumpLandmarksLoaded,
    jumpLandmarks,
    jumpPose,
    jumpTo,
    lockedJumpLandmarks,
    start,
    stop,
    subareaLabels,
    unlockedLandmarkIds,
    unlockedLandmarks,
  };
});

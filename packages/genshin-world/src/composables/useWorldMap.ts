import type { Wallet } from "#src/models/inventory/Wallet";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Ref } from "vue";

import { useExplorationAreas } from "#src/composables/useExplorationAreas";
import { useJumpLandmarks } from "#src/composables/useJumpLandmarks";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { LandmarkIdStatuePointIdMap } from "#src/services/statue/LandmarkIdStatuePointIdMap";
import { readOpenWorldTransPointRewards } from "#src/services/transPoint/readOpenWorldTransPointRewards";
import { getResultAsync } from "@esposter/shared";

// The landmarks the world holds and the ones the player has unlocked, the first unlock of each paid, and the pose a jump
// Lands at. A landmark is unlocked by resonating with it, and each is paid once
export const useWorldMap = ({
  catalogue,
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  regionDataBaseUrl,
  setWallet,
  unlockedLandmarkIds: savedUnlockedLandmarkIds,
  wallet,
}: {
  catalogue: Catalogue;
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  regionDataBaseUrl: string;
  setWallet: (nextWallet: Wallet) => void;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Ref<Wallet>;
}) => {
  // Every landmark a jump lands at, and the ones the player has unlocked: the map, the minimap, the jump list and a revive
  // Offer only those. A new player has unlocked none, and each is unlocked by resonating with it
  const jumpLandmarks = useJumpLandmarks(regionDataBaseUrl, catalogue);
  // The areas the map counts the exploration of, read as the world opens and shown on each area the unlocked statues fill
  const explorationAreas = useExplorationAreas(gameDataBaseUrl);
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
  // A landmark the player activates is unlocked, its first unlock paid, and the world told it was interacted with
  const activateLandmark = (landmarkId: string) => {
    unlockedLandmarkIds.value = new Set([...unlockedLandmarkIds.value, landmarkId]);
    payFirstUnlockReward(landmarkId);
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

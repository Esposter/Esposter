import type { Catalogue } from "#src/models/world/Catalogue";
import type { PlacedDoing } from "#src/services/exploration/placeExplorationDoings";
import type { Ref } from "vue";

import { useExplorationAreas } from "#src/composables/useExplorationAreas";
import { computeNationExplorationPercentage } from "#src/services/exploration/computeNationExplorationPercentage";
import { placeExplorationDoings } from "#src/services/exploration/placeExplorationDoings";
import { computeReputationExploresReached } from "#src/services/reputation/computeReputationExploresReached";
import { useWorldMapStore } from "#src/store/map";
import { useWorldReputationStore } from "#src/store/reputation";
import { useWorldSessionStore } from "#src/store/session";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";

// The areas the map counts the exploration of, each with the placed doings that stand in it. The doings the save records
// Count toward their areas whatever the statues have unlocked, and each exploration threshold the nation's percentage passes
// Pays its Reputation EXP and wallet items once
export const useWorldExploration = ({
  catalogue,
  placedDoings,
  recordedDoingIds,
  savedUnlockedLandmarkIds,
}: {
  catalogue: Catalogue;
  // The placed doings the world holds, each a chest, an Oculus, a puzzle or a camp, by the point it stands at
  placedDoings: Readonly<Ref<PlacedDoing[]>>;
  // The doings the save records as done, by id
  recordedDoingIds: Readonly<Ref<ReadonlySet<string>>>;
  savedUnlockedLandmarkIds: ReadonlySet<string>;
}) => {
  const worldMapStore = useWorldMapStore();
  const { isJumpLandmarksLoaded, jumpLandmarks, unlockedLandmarkIds, unlockedLandmarks } = storeToRefs(worldMapStore);
  const worldReputationStore = useWorldReputationStore();
  const { reputationCity } = storeToRefs(worldReputationStore);
  const { payReputationReward } = worldReputationStore;
  const worldSessionStore = useWorldSessionStore();
  // The areas the map counts the exploration of, read as the world opens, each with the placed doings that stand in it
  const explorationAreas = useExplorationAreas(worldSessionStore.gameDataBaseUrl);
  const placedExplorationAreas = computed(() =>
    placeExplorationDoings(explorationAreas.value, catalogue, placedDoings.value),
  );
  // The unlocked landmarks and the recorded doings whose exploration thresholds are paid: the saved ones, which paid when
  // They were made, and the ones the settle below has counted. An unlock or a doing made before every read has landed
  // Waits outside these sets
  let thresholdPaidLandmarkIds: ReadonlySet<string> = savedUnlockedLandmarkIds;
  let thresholdPaidDoingIds: ReadonlySet<string> = recordedDoingIds.value;
  // Each exploration threshold the nation's percentage passes since the last settle pays once, and a threshold the
  // Percentage already held pays nothing. Nothing settles until the areas, the Reputation and every region are in, so the
  // Percentage before the unlocks is the one the saved landmarks reach
  const settleExplorationThresholds = () => {
    if (!reputationCity.value || placedExplorationAreas.value.length === 0 || !isJumpLandmarksLoaded.value) return;
    const { explores } = reputationCity.value;
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
  watch([reputationCity, placedExplorationAreas, isJumpLandmarksLoaded, recordedDoingIds], settleExplorationThresholds);
  // An unlock settles as it is made, so its threshold pays with the unlock rather than a tick after it
  watch(unlockedLandmarkIds, settleExplorationThresholds, { flush: "sync" });
  return { explorationAreas: placedExplorationAreas };
};

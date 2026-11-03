import type { WorldDoingsOptions } from "#src/models/exploration/WorldDoingsOptions";
import type { PlacedDoing } from "#src/services/exploration/placeExplorationDoings";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { useWorldChestsStore } from "#src/store/chests";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// The doings the world places and the ids the save records of them as done, which the exploration of each area counts
export const useWorldDoings = ({
  clearedCamps,
  foundOculusIds,
  monumentPlaces,
  oculusPlaces,
  timeTrialPlaces,
}: WorldDoingsOptions) => {
  const worldChestsStore = useWorldChestsStore();
  const { openedChestIds, worldChestPlaces } = storeToRefs(worldChestsStore);
  const worldPuzzlesStore = useWorldPuzzlesStore();
  const { puzzleSeelies, settledSeelieIds, solvedPuzzleIds } = storeToRefs(worldPuzzlesStore);
  // The doings the world places, each counted toward the area its point stands in: the chests, the Oculi, the puzzles' marks
  // And Seelies at their courts, and the camps the save records as cleared
  const placedDoings = computed<PlacedDoing[]>(() => [
    ...worldChestPlaces.value.map(({ id, position }) => ({ id, kind: ExplorationKind.Chest, position })),
    ...oculusPlaces.value.map(({ id, position }) => ({ id, kind: ExplorationKind.Oculus, position })),
    ...[...monumentPlaces.filter(({ monument }) => monument !== undefined), ...timeTrialPlaces].map(
      ({ id, position }) => ({ id, kind: ExplorationKind.Puzzle, position }),
    ),
    ...puzzleSeelies.value.map(({ court, id }) => ({ id, kind: ExplorationKind.Puzzle, position: court })),
    ...clearedCamps.value.map(({ id, position }) => ({ id, kind: ExplorationKind.Camp, position })),
  ]);
  // The doings the save records as done, by id: the chests opened, the Oculi found, the puzzles and Seelies settled, and
  // The camps cleared
  const recordedDoingIds = computed<ReadonlySet<string>>(
    () =>
      new Set([
        ...openedChestIds.value,
        ...foundOculusIds.value,
        ...solvedPuzzleIds.value,
        ...settledSeelieIds.value,
        ...clearedCamps.value.map(({ id }) => id),
      ]),
  );
  return { placedDoings, recordedDoingIds };
};

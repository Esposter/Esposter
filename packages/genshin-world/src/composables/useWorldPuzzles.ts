import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";
import type { TimeTrialMarker } from "#src/models/puzzle/TimeTrialMarker";
import type { GroundPoint } from "genshin-engine";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { checkIsSeelieFollowed } from "#src/services/puzzle/checkIsSeelieFollowed";
import { checkIsTimeTrialMarkerReached } from "#src/services/puzzle/checkIsTimeTrialMarkerReached";
import { computeSeelieChestPlaces } from "#src/services/puzzle/computeSeelieChestPlaces";
import { computeTimeTrialChestPlaces } from "#src/services/puzzle/computeTimeTrialChestPlaces";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepSeelie } from "#src/services/puzzle/stepSeelie";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { computed, reactive } from "vue";

// The world's puzzles, the Seelies and the Time Trial Challenges held reactive so the sight's trails, the Seelies' states
// And the challenges' clocks read as they change. A Seelie the save names as settled starts settled at its court, each one
// Steps on the fixed step, led while the character stands within reach of it. A challenge starts once the character
// Reaches its marker, then its clock runs on the same step
export const useWorldPuzzles = (
  seelies: Seelie[],
  savedSettledSeelieIds: ReadonlySet<string>,
  timeTrialPlaces: readonly PuzzlePlace[],
) => {
  const puzzleSeelies = reactive(
    seelies.map((seelie) =>
      savedSettledSeelieIds.has(seelie.id) ? { ...seelie, progress: 1, state: SeelieState.Settled } : seelie,
    ),
  );
  const settledSeelieIds = computed<ReadonlySet<string>>(
    () => new Set(puzzleSeelies.filter(({ state }) => state === SeelieState.Settled).map(({ id }) => id)),
  );
  const seelieChestPlaces = computed(() => computeSeelieChestPlaces(puzzleSeelies));
  const timeTrialMarkers = reactive<TimeTrialMarker[]>(
    timeTrialPlaces.map(({ id, position }) => ({ challenge: createTimeTrialChallenge(), id, position })),
  );
  const timeTrialChestPlaces = computed(() => computeTimeTrialChestPlaces(timeTrialMarkers));
  const stepWorldPuzzles = (deltaSeconds: number, position: GroundPoint): void => {
    for (const seelie of puzzleSeelies) stepSeelie(seelie, deltaSeconds, checkIsSeelieFollowed(seelie, position));
    for (const marker of timeTrialMarkers) {
      if (checkIsTimeTrialMarkerReached(marker, position)) startTimeTrialChallenge(marker.challenge);
      stepTimeTrialChallenge(marker.challenge, deltaSeconds);
    }
  };
  return {
    puzzleSeelies,
    seelieChestPlaces,
    settledSeelieIds,
    stepWorldPuzzles,
    timeTrialChestPlaces,
    timeTrialMarkers,
  };
};

import type { KitBody } from "#src/models/kit/KitBody";
import type { MonumentMarker } from "#src/models/puzzle/MonumentMarker";
import type { PuzzleHit } from "#src/models/puzzle/PuzzleHit";
import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";
import type { TimeTrialChallenge } from "#src/models/puzzle/TimeTrialChallenge";
import type { TimeTrialMarker } from "#src/models/puzzle/TimeTrialMarker";
import type { GroundPoint } from "genshin-engine";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { checkIsSeelieFollowed } from "#src/services/puzzle/checkIsSeelieFollowed";
import { checkIsTimeTrialMarkerReached } from "#src/services/puzzle/checkIsTimeTrialMarkerReached";
import { computeSeelieChestPlaces } from "#src/services/puzzle/computeSeelieChestPlaces";
import { computeTimeTrialChestPlaces } from "#src/services/puzzle/computeTimeTrialChestPlaces";
import { createMonumentPuzzle } from "#src/services/puzzle/createMonumentPuzzle";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepElementalMonument } from "#src/services/puzzle/stepElementalMonument";
import { stepMonumentPuzzle } from "#src/services/puzzle/stepMonumentPuzzle";
import { stepSeelie } from "#src/services/puzzle/stepSeelie";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { strikeElementalMonument } from "#src/services/puzzle/strikeElementalMonument";
import { computed, reactive } from "vue";

// The world's puzzles, the Seelies and the Time Trial Challenges held reactive so the sight's trails, the Seelies' states
// And the challenges' clocks read as they change. A Seelie the save names as settled starts settled at its court, each one
// Steps on the fixed step, led while the character stands within reach of it. A challenge starts once the character
// Reaches its marker, then its clock runs on the same step. A challenge the save names as solved starts solved, and the
// Puzzles solved are the saved ones with each challenge solved in play added
export const useWorldPuzzles = ({
  monumentPlaces,
  savedSettledSeelieIds,
  savedSolvedPuzzleIds,
  seelies,
  timeTrialPlaces,
}: {
  monumentPlaces: readonly PuzzlePlace[];
  savedSettledSeelieIds: ReadonlySet<string>;
  savedSolvedPuzzleIds: ReadonlySet<string>;
  seelies: Seelie[];
  timeTrialPlaces: readonly PuzzlePlace[];
}) => {
  const puzzleSeelies = reactive(
    seelies.map((seelie) =>
      savedSettledSeelieIds.has(seelie.id) ? { ...seelie, progress: 1, state: SeelieState.Settled } : seelie,
    ),
  );
  const settledSeelieIds = computed<ReadonlySet<string>>(
    () => new Set(puzzleSeelies.filter(({ state }) => state === SeelieState.Settled).map(({ id }) => id)),
  );
  // Each monument mark is a puzzle of its own, as the world's data does not group the monuments into puzzles
  const monumentMarkers = reactive<MonumentMarker[]>(
    monumentPlaces.flatMap(({ id, monument, position }) => {
      if (!monument) return [];
      const puzzle = createMonumentPuzzle(monument);
      puzzle.isSolved = savedSolvedPuzzleIds.has(id);
      return [{ id, position, puzzle }];
    }),
  );
  const createMarkerChallenge = (id: string): TimeTrialChallenge => {
    const challenge = createTimeTrialChallenge();
    if (savedSolvedPuzzleIds.has(id)) {
      challenge.state = TimeTrialChallengeState.Solved;
      challenge.struckCount = challenge.targetCount;
    }
    return challenge;
  };
  const timeTrialMarkers = reactive<TimeTrialMarker[]>(
    timeTrialPlaces.map(({ id, position }) => ({ challenge: createMarkerChallenge(id), id, position })),
  );
  const solvedPuzzleIds = computed<ReadonlySet<string>>(
    () =>
      new Set([
        ...savedSolvedPuzzleIds,
        ...monumentMarkers.filter(({ puzzle }) => puzzle.isSolved).map(({ id }) => id),
        ...timeTrialMarkers
          .filter(({ challenge }) => challenge.state === TimeTrialChallengeState.Solved)
          .map(({ id }) => id),
      ]),
  );
  // The chests the puzzles spawn, a settled Seelie's at its court and a solved challenge's at its marker
  const puzzleChestPlaces = computed(() => [
    ...computeSeelieChestPlaces(puzzleSeelies),
    ...computeTimeTrialChestPlaces(timeTrialMarkers),
  ]);
  const stepWorldPuzzles = (deltaSeconds: number, position: GroundPoint): void => {
    for (const seelie of puzzleSeelies) stepSeelie(seelie, deltaSeconds, checkIsSeelieFollowed(seelie, position));
    for (const { puzzle } of monumentMarkers) {
      for (const monument of puzzle.monuments) stepElementalMonument(monument, deltaSeconds);
      stepMonumentPuzzle(puzzle);
    }
    for (const marker of timeTrialMarkers) {
      if (checkIsTimeTrialMarkerReached(marker, position)) startTimeTrialChallenge(marker.challenge);
      stepTimeTrialChallenge(marker.challenge, deltaSeconds);
    }
  };
  // A hit a step lands strikes each monument its area reaches with the hit's element and gauge, and a hit with no element
  // Lights none
  const strikeWorldPuzzles = (body: KitBody, hit: PuzzleHit): void => {
    for (const { position, puzzle } of monumentMarkers) {
      if (hit.element === undefined || !checkIsInAttackArea(hit.hitArea, body, { position })) continue;
      for (const monument of puzzle.monuments) strikeElementalMonument(monument, hit.element, hit.gauge);
    }
  };
  return {
    monumentMarkers,
    puzzleChestPlaces,
    puzzleSeelies,
    settledSeelieIds,
    solvedPuzzleIds,
    stepWorldPuzzles,
    strikeWorldPuzzles,
    timeTrialMarkers,
  };
};

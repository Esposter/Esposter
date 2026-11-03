import type { KitBody } from "#src/models/kit/KitBody";
import type { MonumentMarker } from "#src/models/puzzle/MonumentMarker";
import type { PuzzleHit } from "#src/models/puzzle/PuzzleHit";
import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";
import type { ShrineMarker } from "#src/models/puzzle/ShrineMarker";
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
import { SHRINE_REGION_ID } from "#src/services/puzzle/constants";
import { createMonumentPuzzle } from "#src/services/puzzle/createMonumentPuzzle";
import { createTimeTrialChallenge } from "#src/services/puzzle/createTimeTrialChallenge";
import { startTimeTrialChallenge } from "#src/services/puzzle/startTimeTrialChallenge";
import { stepElementalMonument } from "#src/services/puzzle/stepElementalMonument";
import { stepMonumentPuzzle } from "#src/services/puzzle/stepMonumentPuzzle";
import { stepSeelie } from "#src/services/puzzle/stepSeelie";
import { stepTimeTrialChallenge } from "#src/services/puzzle/stepTimeTrialChallenge";
import { strikeElementalMonument } from "#src/services/puzzle/strikeElementalMonument";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

// The world's puzzles, the Seelies and the Time Trial Challenges held reactive so the sight's trails, the Seelies' states
// And the challenges' clocks read as they change. A Seelie the save names as settled starts settled at its court, each one
// Steps on the fixed step, led while the character stands within reach of it. A challenge starts once the character
// Reaches its marker, then its clock runs on the same step. A challenge the save names as solved starts solved, and the
// Puzzles solved are the saved ones with each challenge solved in play added. The session starts it with the places the
// Regions hold and the save's, and stops it as it unmounts
export const useWorldPuzzlesStore = defineStore("world/puzzles", () => {
  const puzzleSeelies = ref<Seelie[]>([]);
  const monumentMarkers = ref<MonumentMarker[]>([]);
  const timeTrialMarkers = ref<TimeTrialMarker[]>([]);
  // Each shrine is shut until the save names it open or a key opens it, and an open one is kept as solved, the save's one
  // Record of what is opened, so a reload keeps it open with no field of its own
  const shrineMarkers = ref<ShrineMarker[]>([]);
  const savedSolvedPuzzleIds = shallowRef<ReadonlySet<string>>(new Set());
  const settledSeelieIds = computed<ReadonlySet<string>>(
    () => new Set(puzzleSeelies.value.filter(({ state }) => state === SeelieState.Settled).map(({ id }) => id)),
  );
  const solvedPuzzleIds = computed<ReadonlySet<string>>(
    () =>
      new Set([
        ...savedSolvedPuzzleIds.value,
        ...monumentMarkers.value.filter(({ puzzle }) => puzzle.isSolved).map(({ id }) => id),
        ...shrineMarkers.value.filter(({ shrine }) => shrine.isOpen).map(({ id }) => id),
        ...timeTrialMarkers.value
          .filter(({ challenge }) => challenge.state === TimeTrialChallengeState.Solved)
          .map(({ id }) => id),
      ]),
  );
  // The chests the puzzles spawn, a settled Seelie's at its court and a solved challenge's at its marker
  const puzzleChestPlaces = computed(() => [
    ...computeSeelieChestPlaces(puzzleSeelies.value),
    ...computeTimeTrialChestPlaces(timeTrialMarkers.value),
  ]);
  const stepWorldPuzzles = (deltaSeconds: number, position: GroundPoint): void => {
    for (const seelie of puzzleSeelies.value) stepSeelie(seelie, deltaSeconds, checkIsSeelieFollowed(seelie, position));
    for (const { puzzle } of monumentMarkers.value) {
      for (const monument of puzzle.monuments) stepElementalMonument(monument, deltaSeconds);
      stepMonumentPuzzle(puzzle);
    }
    for (const marker of timeTrialMarkers.value) {
      if (checkIsTimeTrialMarkerReached(marker, position)) startTimeTrialChallenge(marker.challenge);
      stepTimeTrialChallenge(marker.challenge, deltaSeconds);
    }
  };
  // A hit a step lands strikes each monument its area reaches with the hit's element and gauge, and a hit with no element
  // Lights none. It also strikes the target of each time trial marker its area reaches, a stand-in for the rings, objects
  // And enemies a target is struck by, since those are not in the world yet
  const strikeWorldPuzzles = (body: KitBody, hit: PuzzleHit): void => {
    for (const { position, puzzle } of monumentMarkers.value) {
      if (hit.element === undefined || !checkIsInAttackArea(hit.hitArea, body, { position })) continue;
      for (const monument of puzzle.monuments) strikeElementalMonument(monument, hit.element, hit.gauge);
    }
    for (const { challenge, position } of timeTrialMarkers.value)
      if (checkIsInAttackArea(hit.hitArea, body, { position })) strikeTimeTrialTarget(challenge);
  };
  const createMarkerChallenge = (id: string): TimeTrialChallenge => {
    const challenge = createTimeTrialChallenge();
    if (savedSolvedPuzzleIds.value.has(id)) {
      challenge.state = TimeTrialChallengeState.Solved;
      challenge.struckCount = challenge.targetCount;
    }
    return challenge;
  };
  const start = (starting: {
    monumentPlaces: readonly PuzzlePlace[];
    savedSettledSeelieIds: ReadonlySet<string>;
    savedSolvedPuzzleIds: ReadonlySet<string>;
    seelies: Seelie[];
    shrinePlaces: readonly PuzzlePlace[];
    timeTrialPlaces: readonly PuzzlePlace[];
  }) => {
    savedSolvedPuzzleIds.value = starting.savedSolvedPuzzleIds;
    puzzleSeelies.value = starting.seelies.map((seelie) =>
      starting.savedSettledSeelieIds.has(seelie.id) ? { ...seelie, progress: 1, state: SeelieState.Settled } : seelie,
    );
    // Each monument mark is a puzzle of its own, as the world's data does not group the monuments into puzzles
    monumentMarkers.value = starting.monumentPlaces.flatMap(({ id, monument, position }) => {
      if (!monument) return [];
      const puzzle = createMonumentPuzzle(monument);
      puzzle.isSolved = starting.savedSolvedPuzzleIds.has(id);
      return [{ id, position, puzzle }];
    });
    timeTrialMarkers.value = starting.timeTrialPlaces.map(({ id, position }) => ({
      challenge: createMarkerChallenge(id),
      id,
      position,
    }));
    shrineMarkers.value = starting.shrinePlaces.map(({ id, position }) => ({
      id,
      position,
      shrine: { isOpen: starting.savedSolvedPuzzleIds.has(id), region: SHRINE_REGION_ID },
    }));
  };
  const stop = () => {
    monumentMarkers.value = [];
    puzzleSeelies.value = [];
    savedSolvedPuzzleIds.value = new Set();
    shrineMarkers.value = [];
    timeTrialMarkers.value = [];
  };
  return {
    monumentMarkers,
    puzzleChestPlaces,
    puzzleSeelies,
    settledSeelieIds,
    shrineMarkers,
    solvedPuzzleIds,
    start,
    stepWorldPuzzles,
    stop,
    strikeWorldPuzzles,
    timeTrialMarkers,
  };
});

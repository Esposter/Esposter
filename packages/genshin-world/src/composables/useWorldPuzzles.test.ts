import type { KitBody } from "#src/models/kit/KitBody";
import type { PuzzleHit } from "#src/models/puzzle/PuzzleHit";
import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";

import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { Element } from "#src/models/Element";
import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { SEELIE_FOLLOW_DISTANCE, TIME_TRIAL_MARKER_REACH_DISTANCE } from "#src/services/puzzle/constants";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { describe, expect, test } from "vitest";

const MONUMENT_ID = "monument";
const MONUMENT_PLACE: PuzzlePlace = {
  id: MONUMENT_ID,
  kind: PuzzleKind.ElementalMonument,
  monument: { element: Element.Pyro, isProvisional: true, isTimed: false },
  position: { x: 0, z: 0 },
};
// A body two metres from the monument, and a hit whose area is a full circle of ten metres about its feet
const STRIKING_BODY: KitBody = { facing: 0, height: 0, position: { x: 2, z: 0 } };
const FULL_CIRCLE_AREA = { angle: Math.PI * 2, height: 10, radius: 10 };
const PYRO_HIT: PuzzleHit = { element: Element.Pyro, gauge: 1, hitArea: FULL_CIRCLE_AREA };
const HYDRO_HIT: PuzzleHit = { element: Element.Hydro, gauge: 1, hitArea: FULL_CIRCLE_AREA };

const createSeelie = (id: string): Seelie => ({
  court: { x: 10, z: 0 },
  id,
  progress: 0,
  start: { x: 0, z: 0 },
  state: SeelieState.Resting,
  unfollowedSeconds: 0,
});

describe(useWorldPuzzles, () => {
  const SETTLED_SEELIE_ID = "settled";
  const RESTING_SEELIE_ID = "resting";
  const TIME_TRIAL_ID = "time-trial";
  const timeTrialPlace: PuzzlePlace = {
    id: TIME_TRIAL_ID,
    kind: PuzzleKind.TimeTrialChallenge,
    position: { x: 0, z: 0 },
  };

  test("a Seelie the save names as settled starts settled at its court", () => {
    expect.hasAssertions();

    const { settledSeelieIds } = useWorldPuzzles({
      monumentPlaces: [],
      savedSettledSeelieIds: new Set([SETTLED_SEELIE_ID]),
      savedSolvedPuzzleIds: new Set(),
      seelies: [createSeelie(SETTLED_SEELIE_ID), createSeelie(RESTING_SEELIE_ID)],
      timeTrialPlaces: [],
    });

    expect([...settledSeelieIds.value]).toStrictEqual([SETTLED_SEELIE_ID]);
  });

  test("a resting Seelie the character stands by is led on the step", () => {
    expect.hasAssertions();

    const { puzzleSeelies, stepWorldPuzzles } = useWorldPuzzles({
      monumentPlaces: [],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set(),
      seelies: [createSeelie(RESTING_SEELIE_ID)],
      timeTrialPlaces: [],
    });
    stepWorldPuzzles(1, { x: SEELIE_FOLLOW_DISTANCE, z: 0 });

    expect(puzzleSeelies[0]?.state).toBe(SeelieState.Led);
  });

  test("a time trial challenge starts once the character reaches its marker", () => {
    expect.hasAssertions();

    const { stepWorldPuzzles, timeTrialMarkers } = useWorldPuzzles({
      monumentPlaces: [],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set(),
      seelies: [],
      timeTrialPlaces: [timeTrialPlace],
    });
    stepWorldPuzzles(0, { x: TIME_TRIAL_MARKER_REACH_DISTANCE + 1, z: 0 });
    const idleState = timeTrialMarkers[0]?.challenge.state;
    stepWorldPuzzles(0, { x: TIME_TRIAL_MARKER_REACH_DISTANCE, z: 0 });

    expect({ idleState, state: timeTrialMarkers[0]?.challenge.state }).toStrictEqual({
      idleState: TimeTrialChallengeState.Idle,
      state: TimeTrialChallengeState.Running,
    });
  });

  test("a challenge solved in play joins the solved puzzle ids", () => {
    expect.hasAssertions();

    const { solvedPuzzleIds, stepWorldPuzzles, timeTrialMarkers } = useWorldPuzzles({
      monumentPlaces: [],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set(),
      seelies: [],
      timeTrialPlaces: [timeTrialPlace],
    });
    stepWorldPuzzles(0, timeTrialPlace.position);
    for (const { challenge } of timeTrialMarkers) strikeTimeTrialTarget(challenge);

    expect([...solvedPuzzleIds.value]).toStrictEqual([TIME_TRIAL_ID]);
  });

  test("a solved puzzle is kept solved after a reload", () => {
    expect.hasAssertions();

    const { solvedPuzzleIds, stepWorldPuzzles, timeTrialMarkers } = useWorldPuzzles({
      monumentPlaces: [],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set([TIME_TRIAL_ID]),
      seelies: [],
      timeTrialPlaces: [timeTrialPlace],
    });
    stepWorldPuzzles(1, timeTrialPlace.position);

    expect({ solvedPuzzleIds: [...solvedPuzzleIds.value], state: timeTrialMarkers[0]?.challenge.state }).toStrictEqual({
      solvedPuzzleIds: [TIME_TRIAL_ID],
      state: TimeTrialChallengeState.Solved,
    });
  });

  test("a strike of its element lights a monument", () => {
    expect.hasAssertions();

    const { monumentMarkers, strikeWorldPuzzles } = useWorldPuzzles({
      monumentPlaces: [MONUMENT_PLACE],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set(),
      seelies: [],
      timeTrialPlaces: [],
    });
    strikeWorldPuzzles(STRIKING_BODY, PYRO_HIT);

    expect(monumentMarkers.map(({ puzzle }) => puzzle.monuments.map(({ isLit }) => isLit))).toStrictEqual([[true]]);
  });

  test("a strike of another element does not light a monument", () => {
    expect.hasAssertions();

    const { monumentMarkers, strikeWorldPuzzles } = useWorldPuzzles({
      monumentPlaces: [MONUMENT_PLACE],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set(),
      seelies: [],
      timeTrialPlaces: [],
    });
    strikeWorldPuzzles(STRIKING_BODY, HYDRO_HIT);

    expect(monumentMarkers.map(({ puzzle }) => puzzle.monuments.map(({ isLit }) => isLit))).toStrictEqual([[false]]);
  });

  test("finishing every target in time spawns the chest", () => {
    expect.hasAssertions();

    const { puzzleChestPlaces, stepWorldPuzzles, strikeWorldPuzzles, timeTrialMarkers } = useWorldPuzzles({
      monumentPlaces: [],
      savedSettledSeelieIds: new Set(),
      savedSolvedPuzzleIds: new Set(),
      seelies: [],
      timeTrialPlaces: [timeTrialPlace],
    });
    stepWorldPuzzles(0, { x: TIME_TRIAL_MARKER_REACH_DISTANCE, z: 0 });
    strikeWorldPuzzles(STRIKING_BODY, PYRO_HIT);

    expect({ chests: puzzleChestPlaces.value.length, state: timeTrialMarkers[0]?.challenge.state }).toStrictEqual({
      chests: 1,
      state: TimeTrialChallengeState.Solved,
    });
  });
});

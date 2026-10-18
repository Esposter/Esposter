import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Seelie } from "#src/models/puzzle/Seelie";

import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { SEELIE_FOLLOW_DISTANCE, TIME_TRIAL_MARKER_REACH_DISTANCE } from "#src/services/puzzle/constants";
import { strikeTimeTrialTarget } from "#src/services/puzzle/strikeTimeTrialTarget";
import { describe, expect, test } from "vitest";

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
});

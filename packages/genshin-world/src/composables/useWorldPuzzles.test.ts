import type { Seelie } from "#src/models/puzzle/Seelie";

import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";

import { useWorldPuzzles } from "#src/composables/useWorldPuzzles";
import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { TimeTrialChallengeState } from "#src/models/puzzle/TimeTrialChallengeState";
import { SEELIE_FOLLOW_DISTANCE, TIME_TRIAL_MARKER_REACH_DISTANCE } from "#src/services/puzzle/constants";
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

  test("a Seelie the save names as settled starts settled at its court", () => {
    expect.hasAssertions();

    const { settledSeelieIds } = useWorldPuzzles(
      [createSeelie(SETTLED_SEELIE_ID), createSeelie(RESTING_SEELIE_ID)],
      new Set([SETTLED_SEELIE_ID]),
      [],
    );

    expect([...settledSeelieIds.value]).toStrictEqual([SETTLED_SEELIE_ID]);
  });

  test("a resting Seelie the character stands by is led on the step", () => {
    expect.hasAssertions();

    const { puzzleSeelies, stepWorldPuzzles } = useWorldPuzzles([createSeelie(RESTING_SEELIE_ID)], new Set(), []);
    stepWorldPuzzles(1, { x: SEELIE_FOLLOW_DISTANCE, z: 0 });

    expect(puzzleSeelies[0]?.state).toBe(SeelieState.Led);
  });

  test("a time trial challenge starts once the character reaches its marker", () => {
    expect.hasAssertions();

    const TIME_TRIAL_ID = "time-trial";
    const timeTrialPlace: PuzzlePlace = {
      id: TIME_TRIAL_ID,
      kind: PuzzleKind.TimeTrialChallenge,
      position: { x: 0, z: 0 },
    };
    const { stepWorldPuzzles, timeTrialMarkers } = useWorldPuzzles([], new Set(), [timeTrialPlace]);
    stepWorldPuzzles(0, { x: TIME_TRIAL_MARKER_REACH_DISTANCE + 1, z: 0 });
    const idleState = timeTrialMarkers[0]?.challenge.state;
    stepWorldPuzzles(0, { x: TIME_TRIAL_MARKER_REACH_DISTANCE, z: 0 });

    expect({ idleState, state: timeTrialMarkers[0]?.challenge.state }).toStrictEqual({
      idleState: TimeTrialChallengeState.Idle,
      state: TimeTrialChallengeState.Running,
    });
  });
});

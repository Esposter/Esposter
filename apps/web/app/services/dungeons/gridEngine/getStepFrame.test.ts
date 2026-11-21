import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";
import type { Position } from "grid-engine-headless";

import { getStepFrame } from "#src/services/dungeons/gridEngine/getStepFrame";
import { getTurnFrame } from "#src/services/dungeons/gridEngine/getTurnFrame";
import { describe, expect, test } from "vitest";

// One reading of the walk: the tile the step left, which the reader shows while the step runs, and how far through the
// Step it is. A progress of zero is no step under way, which the sprite writer draws as a turn
interface WalkSample {
  exitTile: Position;
  progress: number;
}

// Each reading in order, and the frame each one leaves the sprite on
const walk = (frames: FrameRow, state: WalkingFrameState, samples: WalkSample[]): number[] => {
  const frameSequence: number[] = [];
  let currentState = state;
  for (const { exitTile, progress } of samples) {
    currentState =
      progress === 0 ? getTurnFrame(frames, currentState) : getStepFrame(frames, currentState, progress, exitTile);
    frameSequence.push(currentState.frame);
  }
  return frameSequence;
};

describe(getStepFrame, () => {
  const DOWN_FRAMES: FrameRow = { leftFoot: 6, rightFoot: 8, standing: 7 };
  const LEFT_FRAMES: FrameRow = { leftFoot: 9, rightFoot: 11, standing: 10 };
  const STANDING_STATE: WalkingFrameState = { frame: DOWN_FRAMES.standing, isLastFootLeft: false };
  const FIRST_TILE: Position = { x: 0, y: 0 };
  const SECOND_TILE: Position = { x: 0, y: 1 };
  const THIRD_TILE: Position = { x: 0, y: 2 };

  test("a step shows the foot the last step did not plant, then the standing frame, and the next step plants the other foot", () => {
    expect.hasAssertions();

    expect(
      walk(DOWN_FRAMES, STANDING_STATE, [
        { exitTile: FIRST_TILE, progress: 250 },
        { exitTile: FIRST_TILE, progress: 500 },
        { exitTile: FIRST_TILE, progress: 750 },
        { exitTile: SECOND_TILE, progress: 250 },
        { exitTile: SECOND_TILE, progress: 750 },
        { exitTile: THIRD_TILE, progress: 250 },
      ]),
    ).toStrictEqual([6, 6, 7, 8, 7, 6]);
  });

  test("a step whose first reading is already past its midpoint plants its foot, so the next step shows the other foot", () => {
    expect.hasAssertions();

    // The frame is long enough that the first reading of the step is past its midpoint, so the foot is planted on it
    expect(
      walk(DOWN_FRAMES, STANDING_STATE, [
        { exitTile: FIRST_TILE, progress: 750 },
        { exitTile: SECOND_TILE, progress: 250 },
      ]),
    ).toStrictEqual([DOWN_FRAMES.standing, DOWN_FRAMES.rightFoot]);
  });

  test("a step past its midpoint over several readings plants its foot once, however many readings it takes", () => {
    expect.hasAssertions();

    expect(
      walk(DOWN_FRAMES, STANDING_STATE, [
        { exitTile: FIRST_TILE, progress: 750 },
        { exitTile: FIRST_TILE, progress: 800 },
        { exitTile: SECOND_TILE, progress: 250 },
      ]),
    ).toStrictEqual([DOWN_FRAMES.standing, DOWN_FRAMES.standing, DOWN_FRAMES.rightFoot]);
  });

  test("a turn ends the step that planted a foot, so a later step from the tile it left plants its foot again", () => {
    expect.hasAssertions();

    expect(
      walk(DOWN_FRAMES, STANDING_STATE, [
        { exitTile: FIRST_TILE, progress: 750 },
        { exitTile: FIRST_TILE, progress: 0 },
        { exitTile: FIRST_TILE, progress: 750 },
        { exitTile: FIRST_TILE, progress: 250 },
      ]),
    ).toStrictEqual([DOWN_FRAMES.standing, DOWN_FRAMES.standing, DOWN_FRAMES.standing, DOWN_FRAMES.leftFoot]);
  });

  test("a turn shows the standing frame of the new facing and keeps the foot the last step planted", () => {
    expect.hasAssertions();

    const turned = getTurnFrame(LEFT_FRAMES, { frame: 8, isLastFootLeft: true });

    expect(turned).toStrictEqual({ frame: LEFT_FRAMES.standing, isLastFootLeft: true });
    expect(walk(LEFT_FRAMES, turned, [{ exitTile: FIRST_TILE, progress: 250 }])).toStrictEqual([LEFT_FRAMES.rightFoot]);
  });
});

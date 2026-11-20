import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";

import { getStepFrame } from "#src/services/dungeons/gridEngine/getStepFrame";
import { getTurnFrame } from "#src/services/dungeons/gridEngine/getTurnFrame";
import { describe, expect, test } from "vitest";

// Each progress the walk reports in order, and the frame each one leaves the sprite on
const walk = (frames: FrameRow, state: WalkingFrameState, progresses: number[]): number[] => {
  const frameSequence: number[] = [];
  let currentState = state;
  for (const progress of progresses) {
    currentState = getStepFrame(frames, currentState, progress);
    frameSequence.push(currentState.frame);
  }
  return frameSequence;
};

describe(getStepFrame, () => {
  const DOWN_FRAMES: FrameRow = { leftFoot: 6, rightFoot: 8, standing: 7 };
  const LEFT_FRAMES: FrameRow = { leftFoot: 9, rightFoot: 11, standing: 10 };
  const STANDING_STATE: WalkingFrameState = { frame: DOWN_FRAMES.standing, isLastFootLeft: false };

  test("a step shows the foot the last step did not plant, then the standing frame, and the next step plants the other foot", () => {
    expect.hasAssertions();

    expect(walk(DOWN_FRAMES, STANDING_STATE, [250, 500, 750, 250, 750, 250])).toStrictEqual([6, 6, 7, 8, 7, 6]);
  });

  test("a turn shows the standing frame of the new facing and keeps the foot the last step planted", () => {
    expect.hasAssertions();

    const turned = getTurnFrame(LEFT_FRAMES, { frame: 8, isLastFootLeft: true });

    expect(turned).toStrictEqual({ frame: LEFT_FRAMES.standing, isLastFootLeft: true });
    expect(walk(LEFT_FRAMES, turned, [250])).toStrictEqual([LEFT_FRAMES.rightFoot]);
  });
});

import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";

import { HALF_STEP_PROGRESS } from "#src/services/dungeons/gridEngine/constants";

// A step shows the foot the last step did not plant until its midpoint, then the standing frame. The foot a step plants
// Is the other one each time the standing frame follows a foot frame, so the feet alternate from step to step
export const getStepFrame = (frames: FrameRow, state: WalkingFrameState, progress: number): WalkingFrameState => {
  if (progress <= HALF_STEP_PROGRESS)
    return { frame: state.isLastFootLeft ? frames.rightFoot : frames.leftFoot, isLastFootLeft: state.isLastFootLeft };
  if (state.frame === frames.standing) return state;
  return { frame: frames.standing, isLastFootLeft: !state.isLastFootLeft };
};

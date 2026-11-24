import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";

// A turn shows the standing frame of the new facing and keeps which foot the last step planted. A turn is no step, so
// It also ends the step that planted that foot, and the state it returns holds no tile for that step
export const getTurnFrame = (frames: FrameRow, state: WalkingFrameState) => ({
  frame: frames.standing,
  isLastFootLeft: state.isLastFootLeft,
});

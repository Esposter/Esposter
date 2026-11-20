import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";

// A turn shows the standing frame of the new facing and keeps which foot the last step planted
export const getTurnFrame = (frames: FrameRow, state: WalkingFrameState): WalkingFrameState => ({
  frame: frames.standing,
  isLastFootLeft: state.isLastFootLeft,
});

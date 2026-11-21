import type { FrameRow } from "#src/models/dungeons/scene/world/FrameRow";
import type { WalkingFrameState } from "#src/models/dungeons/scene/world/WalkingFrameState";
import type { Position } from "grid-engine-headless";

import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { HALF_STEP_PROGRESS } from "#src/services/dungeons/gridEngine/constants";

// A step shows the foot the last step did not plant until its midpoint, then the standing frame. The step plants the
// Other foot once, on the first reading past its midpoint, and a later reading of the same step finds it planted. The
// Tile a step left tells one step from the next, since two steps in a row never leave the same tile
export const getStepFrame = (frames: FrameRow, state: WalkingFrameState, progress: number, exitTile: Position) => {
  if (progress <= HALF_STEP_PROGRESS)
    return { ...state, frame: state.isLastFootLeft ? frames.rightFoot : frames.leftFoot };
  const exitTileId = getPositionId(exitTile);
  if (state.plantedFrom === exitTileId) return { ...state, frame: frames.standing };
  return { frame: frames.standing, isLastFootLeft: !state.isLastFootLeft, plantedFrom: exitTileId };
};

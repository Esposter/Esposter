import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";
import type { SceneKindRange } from "#src/models/genshinParity/shared/SceneKindRange";

// The frames the trace drew with the camera still, each kind of the scene's objects hidden in turn, and the frames drawn
// With every kind between them: a kind's range lies between the baselines at its index and the next, so its cost on each
// Pass is the GPU's time it saves there against the frames either side of it, and the GPU's drift over the run cancels
export interface SceneKindTrace {
  baselines: FrameRange[];
  kinds: SceneKindRange[];
}

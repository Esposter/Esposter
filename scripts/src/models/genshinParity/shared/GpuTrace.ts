import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";
import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";
import type { SceneKindTrace } from "#src/models/genshinParity/shared/SceneKindTrace";

// Every GPU call of one run, and the animation frame times it was drawn against, so a call's frame index is its place there.
// With the run's main-thread samples, a frame with no GPU call in it is named by the code that held it, and with its passes
// Timed on the GPU, absent where the adapter has no timestamp queries, a frame waiting on the GPU by the work it waited on,
// And the frames drawn with each kind of the scene's objects hidden, which the passes' times price each kind by
export interface GpuTrace {
  calls: GpuCall[];
  cpu?: CpuCapture;
  kinds?: SceneKindTrace;
  passes?: GpuPass[];
  times: number[];
}

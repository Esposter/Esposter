import type { DevFrameStats } from "#src/models/dev/DevFrameStats";
import type { DevRenderInfo } from "#src/models/dev/DevRenderInfo";

// Takes each frame's time and, on the frames it samples, answers the stats to show; it answers nothing between samples
export interface DevFrameStatsSampler {
  sample: (frameMilliseconds: number, info: DevRenderInfo) => DevFrameStats | undefined;
}

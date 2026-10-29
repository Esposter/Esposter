import type { DevRenderInfo } from "#src/models/dev/DevRenderInfo";

// A renderer as the developer stats overlay reads it: only the counters of the frame it last drew
export interface DevRenderer {
  info: DevRenderInfo;
}

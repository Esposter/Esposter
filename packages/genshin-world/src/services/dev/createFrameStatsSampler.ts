import type { DevFrameStatsSampler } from "#src/models/dev/DevFrameStatsSampler";

import { FRAME_STATS_HISTORY_LENGTH, FRAME_STATS_INTERVAL } from "#src/services/dev/constants";
import { computeMedianFrameTime } from "#src/services/dev/computeMedianFrameTime";

// Keeps the last sixty frame times, and on every tenth frame answers their median with the draw calls and triangles the
// Renderer counted for the frame, so the overlay reads the counters rarely enough to cost no frame of its own
export const createFrameStatsSampler = (): DevFrameStatsSampler => {
  const frameTimes: number[] = [];
  let frameCount = 0;
  return {
    sample: (frameMilliseconds, info) => {
      frameTimes.push(frameMilliseconds);
      if (frameTimes.length > FRAME_STATS_HISTORY_LENGTH) frameTimes.shift();
      frameCount += 1;
      if (frameCount % FRAME_STATS_INTERVAL !== 0) return undefined;

      return {
        drawCalls: info.render.calls,
        frameMilliseconds: computeMedianFrameTime(frameTimes),
        triangles: info.render.triangles,
      };
    },
  };
};

import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";
import type { TrailFrameStats } from "#src/services/genshinParity/trail/computeTrailFrameStats";
import type { TrailMeasure } from "#src/services/genshinParity/trail/measureTrail";

import { readClipPixels } from "#src/services/genshinParity/frames/readClipPixels";
import { computeTrailFrameStats } from "#src/services/genshinParity/trail/computeTrailFrameStats";
import { measureTrail } from "#src/services/genshinParity/trail/measureTrail";

// The trail a capture's region draws across its frames, read one frame at a time so that only each frame's statistics
// Are kept, never its pixels
export const measureClipTrail = async (clipPath: string, rect: ImageRegion): Promise<TrailMeasure | undefined> => {
  const frames: TrailFrameStats[] = [];
  for await (const { pixels, seconds } of readClipPixels(clipPath, rect))
    frames.push(computeTrailFrameStats(pixels, rect.width, rect.height, seconds));
  return measureTrail(frames);
};

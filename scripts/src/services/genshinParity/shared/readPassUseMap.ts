import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";

import { getFrameCount } from "#src/services/genshinParity/shared/getFrameCount";

// Each kind of pass over the frames of some ranges, by its encoder and attachment: its GPU time and its count a frame
export const readPassUseMap = (passes: GpuPass[], ranges: FrameRange[]): Map<string, { count: number; ms: number }> => {
  const frameCount = getFrameCount(ranges);
  const passUseMap = new Map<string, { count: number; ms: number }>();
  for (const { detail, frame, gpuMs, label } of passes) {
    if (!ranges.some(({ endFrame, firstFrame }) => frame >= firstFrame && frame < endFrame)) continue;
    const key = `${label} | ${detail}`;
    const use = passUseMap.get(key) ?? { count: 0, ms: 0 };
    passUseMap.set(key, { count: use.count + 1 / frameCount, ms: use.ms + gpuMs / frameCount });
  }
  return passUseMap;
};

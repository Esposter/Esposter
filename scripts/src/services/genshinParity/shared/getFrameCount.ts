import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";

export const getFrameCount = (ranges: FrameRange[]): number =>
  ranges.reduce((total, { endFrame, firstFrame }) => total + endFrame - firstFrame, 0);

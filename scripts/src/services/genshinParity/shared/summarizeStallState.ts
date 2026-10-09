import type { FrameSample } from "#src/models/genshinParity/shared/FrameSample";
import type { StallState } from "#src/models/genshinParity/shared/StallState";

// A frame is kept to a tenth of a millisecond
const TENTHS_PER_MS = 10;
const SLOW_FRAME_MS = 50;
const STALLED_FRAME_MS = 250;

// The summary of one state from the frames drawn while it ran. A frame's time is the gap from the frame before it, so the
// First frame only starts the count: the handler's await lands its tick after the state's own frames begin
export const summarizeStallState = (
  name: string,
  frames: FrameSample[],
  programsBefore: null | number,
  programsAfter: null | number,
): StallState => {
  const frameMs = frames.slice(1).map((frame, index) => frame.time - (frames[index]?.time ?? 0));
  const growthAt: StallState["growthAt"] = [];
  const firstTime = frames[0]?.time ?? 0;
  for (const [index, frame] of frames.entries()) {
    const previousProgramCount = frames[index - 1]?.programs;
    if (index === 0 || frame.programs === null || frame.programs === previousProgramCount) continue;
    growthAt.push({ atMs: Math.round(frame.time - firstTime), programs: frame.programs });
  }

  return {
    frames: frameMs.length,
    growthAt,
    maxFrameMs: Math.round(Math.max(0, ...frameMs) * TENTHS_PER_MS) / TENTHS_PER_MS,
    name,
    over50: frameMs.filter((ms) => ms > SLOW_FRAME_MS).length,
    over250: frameMs.filter((ms) => ms > STALLED_FRAME_MS).length,
    programsAfter,
    programsBefore,
  };
};

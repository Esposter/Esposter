import type { FrameRow } from "#src/models/genshinParity/frames/FrameRow";

import { computeFrameMeasure } from "#src/services/genshinParity/frames/computeFrameMeasure";
import { splitFrames } from "#src/services/genshinParity/frames/splitFrames";
import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";
import { takeOne } from "@esposter/shared";

// One row for each frame of a clip read over a `width` by `height` rectangle, from the rectangle's RGB bytes as they
// Arrive In chunks. The frame at each index is shown at the second given for that index
export const readFrameRows = async (
  chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
  width: number,
  height: number,
  seconds: readonly number[],
): Promise<FrameRow[]> => {
  const rows: FrameRow[] = [];
  for await (const pixels of splitFrames(chunks, width * height * RGB_CHANNEL_COUNT)) {
    const index = rows.length;
    rows.push({ ...computeFrameMeasure(pixels, width, height), index, seconds: takeOne(seconds, index) });
  }
  return rows;
};

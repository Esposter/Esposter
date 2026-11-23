import type { FrameRow } from "#src/models/genshinParity/frames/FrameRow";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { listClipSeconds } from "#src/services/genshinParity/frames/listClipSeconds";
import { readFrameRows } from "#src/services/genshinParity/frames/readFrameRows";
import { spawnClipRegion } from "#src/services/genshinParity/frames/spawnClipRegion";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every frame of a clip read over a rectangle. FFmpeg runs twice: first to list each frame's second, which decodes
// Without Writing any pixels, then to decode the rectangle alone as raw RGB, streamed so only one frame is held at a
// Time. The colour Conversion is the one a cut frame is made with, so a row's colours are the ones the probe reads from
// That frame
export const measureClipFrames = async (clipPath: string, rect: ImageRegion): Promise<FrameRow[]> => {
  const ffmpegPath = await resolveFfmpeg();
  const seconds = listClipSeconds(clipPath, ffmpegPath);
  const { exited, stdout } = spawnClipRegion(clipPath, rect, ffmpegPath);
  const [rows, status] = await Promise.all([readFrameRows(stdout, rect.width, rect.height, seconds), exited]);
  if (status !== 0) throw new InvalidOperationError(Operation.Read, clipPath, `ffmpeg exited with ${status}`);
  if (rows.length !== seconds.length)
    throw new InvalidOperationError(
      Operation.Read,
      clipPath,
      `has ${seconds.length} frames, but ${rows.length} were read`,
    );
  return rows;
};

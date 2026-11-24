import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { listClipSeconds } from "#src/services/genshinParity/frames/listClipSeconds";
import { spawnClipRegion } from "#src/services/genshinParity/frames/spawnClipRegion";
import { splitFrames } from "#src/services/genshinParity/frames/splitFrames";
import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Each frame of a clip over a rectangle, as its RGB bytes and the second it is shown at, one at a time as FFmpeg
// Decodes them, so a clip is never held in memory whole
export const readClipPixels = async function* (
  clipPath: string,
  rect: ImageRegion,
): AsyncGenerator<{ pixels: Uint8Array; seconds: number }> {
  const ffmpegPath = await resolveFfmpeg();
  const seconds = listClipSeconds(clipPath, ffmpegPath);
  const { exited, stdout } = spawnClipRegion(clipPath, rect, ffmpegPath);
  let index = 0;
  for await (const pixels of splitFrames(stdout, rect.width * rect.height * RGB_CHANNEL_COUNT)) {
    yield { pixels, seconds: takeOne(seconds, index) };
    index++;
  }
  const status = await exited;
  if (status !== 0) throw new InvalidOperationError(Operation.Read, clipPath, `ffmpeg exited with ${status}`);
  if (index !== seconds.length)
    throw new InvalidOperationError(Operation.Read, clipPath, `has ${seconds.length} frames, but ${index} were read`);
};

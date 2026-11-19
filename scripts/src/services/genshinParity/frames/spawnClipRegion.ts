import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { RECORDING_FRAME_FILTER } from "#src/services/genshinParity/reference/constants";
import { spawn } from "@esposter/shared-node/child-process";

// FFmpeg decoding a clip's rectangle alone as raw RGB, one frame after another on its stdout, and the code it exits with.
// The colour conversion is the one a cut frame is made with, so a frame's colours are the ones the probe reads from it
export const spawnClipRegion = (clipPath: string, rect: ImageRegion, ffmpegPath: string) => {
  // `exact` keeps the crop at the rectangle's own size, which the frames are split by
  const crop = `crop=${rect.width}:${rect.height}:${rect.x}:${rect.y}:exact=1,${RECORDING_FRAME_FILTER}`;
  const child = spawn(
    ffmpegPath,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      clipPath,
      "-map",
      "0:v:0",
      "-vf",
      crop,
      "-fps_mode",
      "passthrough",
      "-f",
      "rawvideo",
      "pipe:1",
    ],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  const exited = new Promise<null | number>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  return { exited, stdout: child.stdout };
};

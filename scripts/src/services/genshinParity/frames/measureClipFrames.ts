import type { FrameRow } from "#src/models/genshinParity/frames/FrameRow";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { parseShowinfoSeconds } from "#src/services/genshinParity/frames/parseShowinfoSeconds";
import { readFrameRows } from "#src/services/genshinParity/frames/readFrameRows";
import { RECORDING_FRAME_FILTER } from "#src/services/genshinParity/reference/constants";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn, spawnSync } from "@esposter/shared-node/child-process";

// Every frame of a clip read over a rectangle. FFmpeg runs twice: first to list each frame's second, which decodes without
// Writing any pixels, then to decode the rectangle alone as raw RGB, streamed so only one frame is held at a time. The colour
// Conversion is the one a cut frame is made with, so a row's colours are the ones the probe reads from that frame
export const measureClipFrames = async (clipPath: string, rect: ImageRegion): Promise<FrameRow[]> => {
  const ffmpegPath = await resolveFfmpeg();
  const listing = spawnSync(
    ffmpegPath,
    [
      "-hide_banner",
      "-loglevel",
      "info",
      "-i",
      clipPath,
      "-map",
      "0:v:0",
      "-vf",
      "showinfo",
      "-fps_mode",
      "passthrough",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8", maxBuffer: 1024 ** 3 },
  );
  if (listing.status !== 0)
    throw new InvalidOperationError(
      Operation.Read,
      clipPath,
      listing.stderr || listing.error?.message || `exited with ${listing.status}`,
    );
  const seconds = parseShowinfoSeconds(listing.stderr);
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
  const exited = new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  const [rows, status] = await Promise.all([readFrameRows(child.stdout, rect.width, rect.height, seconds), exited]);
  if (status !== 0) throw new InvalidOperationError(Operation.Read, clipPath, `ffmpeg exited with ${status}`);
  if (rows.length !== seconds.length)
    throw new InvalidOperationError(
      Operation.Read,
      clipPath,
      `has ${seconds.length} frames, but ${rows.length} were read`,
    );
  return rows;
};

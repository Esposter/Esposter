import { parseShowinfoSeconds } from "#src/services/genshinParity/frames/parseShowinfoSeconds";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// The second each frame of a clip is shown at, from FFmpeg's showinfo filter, which decodes every frame without writing
// Any pixels
export const listClipSeconds = (clipPath: string, ffmpegPath: string): number[] => {
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
  return parseShowinfoSeconds(listing.stderr);
};

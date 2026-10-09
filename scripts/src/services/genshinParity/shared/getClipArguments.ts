import { CAPTURES_DIRECTORY, CLIP_NAME_REGEX } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The yt-dlp arguments for one section of a public video: the best MP4 at or under 1080 high, merged by the pinned
// FFmpeg, saved into captures as `yt-<videoId>-<name>.mp4`, and its path printed once written. A name is a file name's
// Part, so a path or a separator is refused rather than written somewhere else
export const getClipArguments = (
  url: string,
  fromSeconds: number,
  toSeconds: number,
  name: string,
  ffmpegPath: string,
): string[] => {
  if (!Number.isFinite(fromSeconds) || !Number.isFinite(toSeconds) || fromSeconds < 0 || toSeconds <= fromSeconds)
    throw new InvalidOperationError(Operation.Read, url, `has no section from ${fromSeconds} to ${toSeconds}`);
  if (!CLIP_NAME_REGEX.test(name)) throw new InvalidOperationError(Operation.Read, name, "is not a clip name");
  return [
    "--no-playlist",
    "--no-simulate",
    "--print",
    "after_move:filepath",
    "--download-sections",
    `*${fromSeconds}-${toSeconds}`,
    "--format",
    "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]",
    "--merge-output-format",
    "mp4",
    "--ffmpeg-location",
    ffmpegPath,
    "--output",
    join(CAPTURES_DIRECTORY, `yt-%(id)s-${name}.%(ext)s`),
    url,
  ];
};

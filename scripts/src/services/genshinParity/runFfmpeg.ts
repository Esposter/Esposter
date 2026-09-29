import { execFileSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

// Runs ffmpeg quiet but for errors, overwriting what it writes; a failed run throws with ffmpeg's own message. It
// Blocks, since the tool does one thing at a time
export const runFfmpeg = (args: string[]): void => {
  execFileSync(ffmpegPath ?? "ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
};

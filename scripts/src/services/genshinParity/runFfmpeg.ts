import { resolveFfmpeg } from "#src/services/genshinParity/resolveFfmpeg";
import { execFileSync } from "node:child_process";

// Runs FFmpeg quiet but for errors, overwriting what it writes; a failed run throws with FFmpeg's own message. It
// Blocks, since the tool does one thing at a time
export const runFfmpeg = async (args: string[]): Promise<void> => {
  const ffmpegPath = await resolveFfmpeg();
  execFileSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args]);
};

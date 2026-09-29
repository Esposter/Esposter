import { resolveFfmpeg } from "#src/services/genshinParity/resolveFfmpeg";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// Runs FFmpeg quiet but for errors, overwriting what it writes, and blocking, since the tool does one thing at a time.
// A wall-clock limit ends a run that FFmpeg's own `-t` would not: window capture counts only the frames the window
// Gives, and a minimised game gives none, so a recording would wait for the game forever. Ending one there is its
// Expected end, and a Matroska file stays readable up to it; any other failure throws with FFmpeg's own message
export const runFfmpeg = async (args: string[], wallClockLimitMs?: number): Promise<void> => {
  const ffmpegPath = await resolveFfmpeg();
  const { signal, status, stderr } = spawnSync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    encoding: "utf8",
    timeout: wallClockLimitMs,
  });
  if (status === 0 || (wallClockLimitMs !== undefined && signal !== null)) return;
  throw new InvalidOperationError(Operation.Create, "ffmpeg", stderr);
};

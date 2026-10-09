import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { getClipArguments } from "#src/services/genshinParity/shared/getClipArguments";
import { resolveFfmpeg } from "#src/services/genshinParity/shared/resolveFfmpeg";
import { resolveYtDlp } from "#src/services/genshinParity/shared/resolveYtDlp";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";

// One section of a public video downloaded with yt-dlp into captures, returning the file's path. Blocking, like the
// FFmpeg runs, since the tool does one thing at a time; yt-dlp's progress shows on this terminal
export const downloadClip = async (
  url: string,
  fromSeconds: number,
  toSeconds: number,
  name: string,
): Promise<string> => {
  const ffmpegPath = await resolveFfmpeg();
  const clipArguments = getClipArguments(url, fromSeconds, toSeconds, name, ffmpegPath);
  const ytDlpPath = await resolveYtDlp();
  await mkdir(CAPTURES_DIRECTORY, { recursive: true });
  const { error, status, stdout } = spawnSync(ytDlpPath, clipArguments, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (status !== 0) throw new InvalidOperationError(Operation.Create, url, error?.message ?? `exited with ${status}`);
  return stdout.trim();
};

import { getClipArguments } from "#src/services/recreation/video/getClipArguments";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { resolveYtDlp } from "#src/services/recreation/video/resolveYtDlp";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdir } from "node:fs/promises";

// One section of a public video downloaded with yt-dlp into the directory, returning the file's path. Blocking, like the
// FFmpeg runs, since the tool does one thing at a time; yt-dlp's progress shows on this terminal
export const downloadClip = async (
  url: string,
  fromSeconds: number,
  toSeconds: number,
  name: string,
  directory: string,
): Promise<string> => {
  const ffmpegPath = await resolveFfmpeg();
  const clipArguments = getClipArguments(url, fromSeconds, toSeconds, name, ffmpegPath, directory);
  const ytDlpPath = await resolveYtDlp();
  await mkdir(directory, { recursive: true });
  const { error, status, stdout } = spawnSync(ytDlpPath, clipArguments, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (status !== 0) throw new InvalidOperationError(Operation.Create, url, error?.message ?? `exited with ${status}`);
  return stdout.trim();
};

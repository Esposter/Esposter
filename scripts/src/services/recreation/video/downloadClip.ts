import { getClipArguments } from "#src/services/recreation/video/getClipArguments";
import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { resolveYtDlp } from "#src/services/recreation/video/resolveYtDlp";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { basename, join } from "node:path";

// One section of a public video downloaded with yt-dlp into the directory, returning the file's path. Blocking, like the
// FFmpeg runs, since the tool does one thing at a time; yt-dlp's progress shows on this terminal. yt-dlp names a section's
// Partial file after the clip, so two runs of one clip in one folder rename each other's, and the run that loses exits 1
// Beside a clip the other already wrote. Each run downloads into a folder of its own, and its finished file is moved into
// The directory under the same name, replacing the other run's
export const downloadClip = async (
  url: string,
  fromSeconds: number,
  toSeconds: number,
  name: string,
  directory: string,
): Promise<string> => {
  const ffmpegPath = await resolveFfmpeg();
  const ytDlpPath = await resolveYtDlp();
  await mkdir(directory, { recursive: true });
  const runDirectory = await mkdtemp(join(directory, ".clip-"));
  return withFinalizerAsync(
    async () => {
      const clipArguments = getClipArguments(url, fromSeconds, toSeconds, name, ffmpegPath, runDirectory);
      const { error, status, stdout } = spawnSync(ytDlpPath, clipArguments, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
      });
      if (status !== 0)
        throw new InvalidOperationError(Operation.Create, url, error?.message ?? `exited with ${status}`);
      const path = stdout.trim();
      const finalPath = join(directory, basename(path));
      await rename(path, finalPath);
      return finalPath;
    },
    () => rm(runDirectory, { force: true, recursive: true }),
  );
};

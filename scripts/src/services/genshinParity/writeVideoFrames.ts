import { runFfmpeg } from "#src/services/genshinParity/runFfmpeg";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// A video's frames at a fixed rate, sampled by ffmpeg from a start and for a length when given, so one event of a long
// Recording is read at full rate without sampling the rest
export const writeVideoFrames = async (
  path: string,
  framesPerSecond: number,
  directory: string,
  startSeconds: number,
  durationSeconds?: number,
): Promise<string[]> => {
  const window = [
    "-ss",
    String(startSeconds),
    ...(durationSeconds === undefined ? [] : ["-t", String(durationSeconds)]),
  ];
  await runFfmpeg([...window, "-i", path, "-vf", `fps=${framesPerSecond}`, join(directory, "%04d.png")]);
  const filenames = await readdir(directory);
  return filenames
    .toSorted((firstFilename, secondFilename) =>
      firstFilename.localeCompare(secondFilename, undefined, { numeric: true }),
    )
    .map((filename) => join(directory, filename));
};

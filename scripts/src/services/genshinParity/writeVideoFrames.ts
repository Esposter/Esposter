import { runFfmpeg } from "#src/services/genshinParity/runFfmpeg";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// A video's frames at a fixed rate, sampled by ffmpeg
export const writeVideoFrames = async (path: string, framesPerSecond: number, directory: string): Promise<string[]> => {
  runFfmpeg(["-i", path, "-vf", `fps=${framesPerSecond}`, join(directory, "%04d.png")]);
  const filenames = await readdir(directory);
  return filenames
    .toSorted((firstFilename, secondFilename) => firstFilename.localeCompare(secondFilename))
    .map((filename) => join(directory, filename));
};

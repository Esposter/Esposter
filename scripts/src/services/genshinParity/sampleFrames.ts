import { FRAMES_DIRECTORY, VIDEO_EXTENSIONS } from "#src/services/genshinParity/constants";
import { resolveSource } from "#src/services/genshinParity/resolveSource";
import { writeAnimatedFrames } from "#src/services/genshinParity/writeAnimatedFrames";
import { writeVideoFrames } from "#src/services/genshinParity/writeVideoFrames";
import { writeContactSheet } from "#src/services/genshinParity/writeContactSheet";
import { mkdir, rm } from "node:fs/promises";
import { basename, extname, join } from "node:path";

// A motion (a video, or an animated GIF or WebP) as still frames at a fixed rate, frame n at (n - 1) / rate seconds, and a contact sheet of them all
export const sampleFrames = async (source: string, framesPerSecond: number): Promise<void> => {
  const path = await resolveSource(source);
  const directory = join(FRAMES_DIRECTORY, basename(path, extname(path)));
  await rm(directory, { force: true, recursive: true });
  await mkdir(directory, { recursive: true });
  const framePaths = VIDEO_EXTENSIONS.has(extname(path).toLowerCase())
    ? await writeVideoFrames(path, framesPerSecond, directory)
    : await writeAnimatedFrames(path, framesPerSecond, directory);
  const sheetPath = join(directory, "sheet.png");
  await writeContactSheet(framePaths, framesPerSecond, sheetPath);
  console.log(`${framePaths.length} frames, ${(1000 / framesPerSecond).toFixed(0)}ms apart: ${directory}`);
  console.log(sheetPath);
};

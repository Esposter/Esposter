import { CONTACT_SHEET_NAME, FRAMES_DIRECTORY, VIDEO_EXTENSIONS } from "#src/services/genshinParity/constants";
import { resolveSource } from "#src/services/genshinParity/resolveSource";
import { writeAnimatedFrames } from "#src/services/genshinParity/writeAnimatedFrames";
import { writeContactSheet } from "#src/services/genshinParity/writeContactSheet";
import { writeVideoFrames } from "#src/services/genshinParity/writeVideoFrames";
import { mkdir, rm } from "node:fs/promises";
import { basename, extname, join } from "node:path";

// A motion (a video, or an animated GIF or WebP) as still frames at a fixed rate, frame n at start + (n - 1) / rate
// Seconds, and a contact sheet of them all; a motion can be sampled over a window of it, kept in its own folder
export const sampleFrames = async (
  source: string,
  framesPerSecond: number,
  startSeconds: number,
  durationSeconds?: number,
): Promise<void> => {
  const path = await resolveSource(source);
  const windowSuffix = startSeconds > 0 || durationSeconds !== undefined ? `@${startSeconds}` : "";
  const directory = join(FRAMES_DIRECTORY, `${basename(path, extname(path))}${windowSuffix}`);
  await rm(directory, { force: true, recursive: true });
  await mkdir(directory, { recursive: true });
  const framePaths = VIDEO_EXTENSIONS.has(extname(path).toLowerCase())
    ? await writeVideoFrames(path, framesPerSecond, directory, startSeconds, durationSeconds)
    : await writeAnimatedFrames(path, framesPerSecond, directory, startSeconds, durationSeconds);
  const sheetPath = join(directory, CONTACT_SHEET_NAME);
  await writeContactSheet(framePaths, framesPerSecond, startSeconds, sheetPath);
  console.log(`${framePaths.length} frames, ${(1000 / framesPerSecond).toFixed(0)}ms apart: ${directory}`);
  console.log(sheetPath);
};

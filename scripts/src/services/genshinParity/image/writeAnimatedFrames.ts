import { join } from "node:path";
import sharp from "sharp";

// An animated image's frames at a fixed rate, from a start and for a length when given, clamped to the animation's own:
// Each sample is the frame showing at that moment by the frames' own delays, since the wiki serves an animation as an
// Animated WebP that ffmpeg cannot decode
export const writeAnimatedFrames = async (
  path: string,
  framesPerSecond: number,
  directory: string,
  startSeconds: number,
  durationSeconds?: number,
): Promise<string[]> => {
  const { delay = [], pages = 1 } = await sharp(path).metadata();
  const endTimesMs: number[] = [];
  for (let page = 0; page < pages; page++) endTimesMs.push((endTimesMs.at(-1) ?? 0) + (delay[page] ?? 100));
  const durationMs = endTimesMs.at(-1) ?? 0;
  const startTimeMs = startSeconds * 1000;
  const windowEndTimeMs =
    durationSeconds === undefined ? durationMs : Math.min(durationMs, startTimeMs + durationSeconds * 1000);
  const sampleCount = Math.max(0, Math.ceil(((windowEndTimeMs - startTimeMs) * framesPerSecond) / 1000));
  return Promise.all(
    Array.from({ length: sampleCount }, async (_, sample) => {
      const timeMs = startTimeMs + (sample * 1000) / framesPerSecond;
      const page = Math.max(
        0,
        endTimesMs.findIndex((endTimeMs) => timeMs < endTimeMs),
      );
      const framePath = join(directory, `${String(sample + 1).padStart(4, "0")}.png`);
      await sharp(path, { page }).png().toFile(framePath);
      return framePath;
    }),
  );
};

import { join } from "node:path";
import sharp from "sharp";

// An animated image's frames at a fixed rate: each sample is the frame showing at that moment by the frames' own
// Delays, since the wiki serves an animation as an animated WebP that ffmpeg cannot decode
export const writeAnimatedFrames = async (
  path: string,
  framesPerSecond: number,
  directory: string,
): Promise<string[]> => {
  const { delay = [], pages = 1 } = await sharp(path).metadata();
  const endTimesMs: number[] = [];
  for (let page = 0; page < pages; page++) endTimesMs.push((endTimesMs.at(-1) ?? 0) + (delay[page] ?? 100));
  const durationMs = endTimesMs.at(-1) ?? 0;
  const sampleCount = Math.ceil((durationMs * framesPerSecond) / 1000);
  return Promise.all(
    Array.from({ length: sampleCount }, async (_, sample) => {
      const timeMs = (sample * 1000) / framesPerSecond;
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

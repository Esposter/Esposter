import { runFfmpeg } from "#src/services/genshinParity/shared/runFfmpeg";
import { rm } from "node:fs/promises";
import sharp from "sharp";

// One lossless frame of a recording at a second, as PNG, cropped by the FFmpeg filter given. FFmpeg tags the frame with
// The recording's gamma and primaries, which a browser then colour-manages, so a frame drawn as a backdrop would come out
// Darker than its own file; rewritten untagged, it reads alike in both
export const writeCaptureFrame = async (
  capturePath: string,
  seconds: number,
  path: string,
  filter: string[],
): Promise<void> => {
  const framePath = `${path}.frame.png`;
  await runFfmpeg(["-ss", String(seconds), "-i", capturePath, ...filter, "-frames:v", "1", framePath]);
  await sharp(framePath).png().toFile(path);
  await rm(framePath);
};

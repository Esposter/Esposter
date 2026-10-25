import { resolveSource } from "#src/services/genshinParity/shared/resolveSource";
import { writeVideoFrames } from "#src/services/recreation/video/writeVideoFrames";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Each of our stills over the recording's frame at its moment, the recording scaled to our width
export const pairWithRecording = async (
  framePaths: readonly string[],
  directory: string,
  { source, startSeconds }: { source: string; startSeconds: number },
  stepMs: number,
): Promise<string[]> => {
  const recordingDirectory = join(directory, "recording");
  const pairsDirectory = join(directory, "pairs");
  await Promise.all([mkdir(recordingDirectory), mkdir(pairsDirectory)]);
  const recordingPaths = await writeVideoFrames(
    await resolveSource(source),
    1000 / stepMs,
    recordingDirectory,
    startSeconds,
    (framePaths.length * stepMs) / 1000,
  );
  return Promise.all(
    framePaths.map(async (framePath, index) => {
      const ours = sharp(framePath);
      const { height, width } = await ours.metadata();
      const recordingPath = recordingPaths[index];
      const recording = recordingPath ? await sharp(recordingPath).resize({ height, width }).toBuffer() : undefined;
      const pairPath = join(pairsDirectory, `${String(index + 1).padStart(4, "0")}.png`);
      await sharp({ create: { background: "#000", channels: 3, height: height * 2, width } })
        .composite([
          { input: await ours.toBuffer(), left: 0, top: 0 },
          ...(recording ? [{ input: recording, left: 0, top: height }] : []),
        ])
        .png()
        .toFile(pairPath);
      return pairPath;
    }),
  );
};

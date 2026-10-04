import { resolveFfmpeg } from "#src/services/genshinParity/shared/resolveFfmpeg";
import { execFileSync } from "node:child_process";

// Any audio FFmpeg reads, a recording's or a decoded sound's, as one channel of 32-bit samples at a rate, its channels
// Averaged, from `startFrame` counted at the audio's own rate on, since FFmpeg resamples only after its filters
export const readAudioSamples = async (path: string, sampleRate: number, startFrame = 0): Promise<Float32Array> => {
  const ffmpegPath = await resolveFfmpeg();
  const output = execFileSync(
    ffmpegPath,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      path,
      "-af",
      `atrim=start_sample=${startFrame}`,
      "-ac",
      "1",
      "-ar",
      String(sampleRate),
      "-f",
      "f32le",
      "pipe:1",
    ],
    { maxBuffer: 1024 ** 3 },
  );
  // Copied out, since a buffer Node pools may start where a float cannot
  return new Float32Array(output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength));
};

import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { execFileAsync } from "@esposter/shared-node/child-process";

// Any audio FFmpeg reads, a recording's or a decoded sound's, as one channel of 32-bit samples at a rate, its channels
// Averaged, from `startFrame` counted at the audio's own rate on, since FFmpeg resamples only after its filters. FFmpeg
// Runs as its own process, so callers decoding several sources overlap them
export const readAudioSamples = async (path: string, sampleRate: number, startFrame = 0): Promise<Float32Array> => {
  const ffmpegPath = await resolveFfmpeg();
  const { stdout: output } = await execFileAsync(
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
    { encoding: "buffer", maxBuffer: 1024 ** 3 },
  );
  return new Float32Array(output.buffer, output.byteOffset, output.byteLength / Float32Array.BYTES_PER_ELEMENT);
};

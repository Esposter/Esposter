import { resolveFfmpeg } from "#src/services/recreation/video/resolveFfmpeg";
import { execFileAsync } from "@esposter/shared-node/child-process";

// Any audio FFmpeg reads as two channels of 32-bit samples at a rate, left then right, a single channel heard in both
export const readStereoSamples = async (path: string, sampleRate: number): Promise<[Float32Array, Float32Array]> => {
  const ffmpegPath = await resolveFfmpeg();
  const { stdout: output } = await execFileAsync(
    ffmpegPath,
    ["-hide_banner", "-loglevel", "error", "-i", path, "-ac", "2", "-ar", String(sampleRate), "-f", "f32le", "pipe:1"],
    { encoding: "buffer", maxBuffer: 1024 ** 3 },
  );
  const interleaved = new Float32Array(
    output.buffer,
    output.byteOffset,
    output.byteLength / Float32Array.BYTES_PER_ELEMENT,
  );
  const left = new Float32Array(interleaved.length / 2);
  const right = new Float32Array(interleaved.length / 2);
  for (let frame = 0; frame < left.length; frame++) {
    left[frame] = interleaved[2 * frame] ?? 0;
    right[frame] = interleaved[2 * frame + 1] ?? 0;
  }
  return [left, right];
};

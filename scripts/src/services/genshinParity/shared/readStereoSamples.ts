import { resolveFfmpeg } from "#src/services/genshinParity/shared/resolveFfmpeg";
import { execFileSync } from "node:child_process";

// Any audio FFmpeg reads as two channels of 32-bit samples at a rate, left then right, a single channel heard in both
export const readStereoSamples = async (path: string, sampleRate: number): Promise<[Float32Array, Float32Array]> => {
  const ffmpegPath = await resolveFfmpeg();
  const output = execFileSync(
    ffmpegPath,
    ["-hide_banner", "-loglevel", "error", "-i", path, "-ac", "2", "-ar", String(sampleRate), "-f", "f32le", "pipe:1"],
    { maxBuffer: 1024 ** 3 },
  );
  // Copied out, since a buffer Node pools may start where a float cannot
  const interleaved = new Float32Array(output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength));
  const left = new Float32Array(interleaved.length / 2);
  const right = new Float32Array(interleaved.length / 2);
  for (let frame = 0; frame < left.length; frame++) {
    left[frame] = interleaved[2 * frame] ?? 0;
    right[frame] = interleaved[2 * frame + 1] ?? 0;
  }
  return [left, right];
};

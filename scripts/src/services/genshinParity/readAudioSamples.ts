import { resolveFfmpeg } from "#src/services/genshinParity/resolveFfmpeg";
import { execFileSync } from "node:child_process";

// Any audio FFmpeg reads, a recording's or a decoded sound's, as one channel of 32-bit samples at a rate, its channels
// Averaged
export const readAudioSamples = async (path: string, sampleRate: number): Promise<Float32Array> => {
  const ffmpegPath = await resolveFfmpeg();
  const output = execFileSync(
    ffmpegPath,
    ["-hide_banner", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", String(sampleRate), "-f", "f32le", "pipe:1"],
    { maxBuffer: 1024 ** 3 },
  );
  // Copied out, since a buffer Node pools may start where a float cannot
  return new Float32Array(output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength));
};

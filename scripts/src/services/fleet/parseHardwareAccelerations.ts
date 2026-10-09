// `ffmpeg -hwaccels` lists its methods under a header line, one indented name per line
export const parseHardwareAccelerations = (output: string): string[] =>
  output
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean);

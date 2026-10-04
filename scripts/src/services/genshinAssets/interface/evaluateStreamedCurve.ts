import type { StreamedKey } from "#src/models/genshinAssets/interface/StreamedKey";

// A streamed curve's value at a time: its last key at or before the time, its cubic in the time since that key; before
// Its first key, the first key's value
export const evaluateStreamedCurve = (keys: readonly StreamedKey[], time: number): number => {
  const key = keys.findLast((candidate) => candidate.time <= time) ?? keys[0];
  if (!key) return 0;
  const [a, b, c, d] = key.coefficients;
  const elapsed = Math.max(time - key.time, 0);
  return ((a * elapsed + b) * elapsed + c) * elapsed + d;
};

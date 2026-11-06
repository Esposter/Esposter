// FNV-1a over the seed's code points, an unsigned 32-bit hash that is the same on every device
export const hashSurveySeed = (seed: string): number => {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

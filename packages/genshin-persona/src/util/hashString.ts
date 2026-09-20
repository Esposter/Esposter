// FNV-1a over UTF-16 code units: a few lines, stable across runtimes, and the same seed always lands on the same
// Candidate, which is all a day's tie-break needs
const FNV_OFFSET_BASIS = 0x81_1c_9d_c5;
const FNV_PRIME = 0x01_00_01_93;

export const hashString = (value: string): number => {
  let hash = FNV_OFFSET_BASIS;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }

  return hash;
};

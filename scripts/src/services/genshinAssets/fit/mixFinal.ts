import { rotateLeft } from "#src/services/genshinAssets/fit/rotateLeft";

// Bob Jenkins' final mix over three uint32 words, returning the last one
export const mixFinal = (wordA: number, wordB: number, wordC: number): number => {
  let [a, b, c] = [wordA >>> 0, wordB >>> 0, wordC >>> 0];
  c = (c ^ b) >>> 0;
  c = (c - rotateLeft(b, 14)) >>> 0;
  a = (a ^ c) >>> 0;
  a = (a - rotateLeft(c, 11)) >>> 0;
  b = (b ^ a) >>> 0;
  b = (b - rotateLeft(a, 25)) >>> 0;
  c = (c ^ b) >>> 0;
  c = (c - rotateLeft(b, 16)) >>> 0;
  a = (a ^ c) >>> 0;
  a = (a - rotateLeft(c, 4)) >>> 0;
  b = (b ^ a) >>> 0;
  b = (b - rotateLeft(a, 14)) >>> 0;
  c = (c ^ b) >>> 0;
  return (c - rotateLeft(b, 24)) >>> 0;
};

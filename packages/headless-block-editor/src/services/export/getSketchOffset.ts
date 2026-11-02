import { SKETCH_HASH_MODULUS, SKETCH_OFFSET_LIMIT } from "#src/services/export/constants";

// A hand-drawn offset within the sketch's limit, read from a hash of its key, so the same key moves a point by the same amount on every render
export const getSketchOffset = (key: string): number => {
  let hash = 0;
  for (const character of key) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % SKETCH_HASH_MODULUS;
  return ((2 * hash) / SKETCH_HASH_MODULUS - 1) * SKETCH_OFFSET_LIMIT;
};

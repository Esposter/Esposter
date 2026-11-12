import type { SketchLevel } from "#src/models/SketchLevel";

import { SKETCH_HASH_MODULUS, SKETCH_LEVEL_AMPLITUDES, SKETCH_OFFSET_LIMIT } from "#src/services/export/constants";

// A hand-drawn offset at a sketch level, within that level's reach and read from a hash of its key, so the same key moves a point by the same amount on every render
export const getSketchOffset = (key: string, sketchLevel: SketchLevel): number => {
  let hash = 0;
  for (const character of key) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % SKETCH_HASH_MODULUS;
  return ((2 * hash) / SKETCH_HASH_MODULUS - 1) * SKETCH_OFFSET_LIMIT * SKETCH_LEVEL_AMPLITUDES[sketchLevel];
};

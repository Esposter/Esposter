import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// The first frames of a constant's list, descending through each level's first element
export const readFirstGoFrames = (value: GoValue | undefined): GoValue | undefined =>
  Array.isArray(value) ? readFirstGoFrames(value[0]) : value;

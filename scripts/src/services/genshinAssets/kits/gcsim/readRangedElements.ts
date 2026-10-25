import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// The elements a range runs once each over: a constant slice of numbers, else the rows of a talent table.
// A talent table's rows are not numbers, and no constant gives them. Undefined where the range is neither
export const readRangedElements = (
  slice: GoValue | undefined,
  rowCount: number | undefined,
): readonly unknown[] | undefined => {
  if (Array.isArray(slice)) return slice.every((element) => typeof element === "number") ? slice : undefined;
  return rowCount === undefined ? undefined : Array.from({ length: rowCount });
};

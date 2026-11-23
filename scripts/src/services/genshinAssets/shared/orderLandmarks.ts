import { compareNaturally } from "#src/services/shared/compareNaturally";
import { compareText } from "@esposter/shared";

// A region file's landmarks in one total order: by their ids with each run of digits read as a number, and an id that
// Reads alike in digits (`5` and `05`) broken by its code units. Each writer of the file rebuilds it with its own kind
// Last, so two writers would move each other's landmarks on every run; sorted by this key, the file is the same
// Whichever Writer ran last
export const orderLandmarks = <T extends { id: string }>(landmarks: readonly T[]): T[] =>
  landmarks.toSorted((left, right) => compareNaturally(left.id, right.id) || compareText(left.id, right.id));

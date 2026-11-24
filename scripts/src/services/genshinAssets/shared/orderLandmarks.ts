import { compareNaturally } from "#src/services/shared/compareNaturally";
import { compareText } from "@esposter/shared";

// A region file's landmarks in one total order: by their ids with each run of digits read as a number.
// An id that reads alike in digits (`5` and `05`) is broken by its code units.
// Each writer of the file rebuilds it with its own kind last.
// Two writers would move each other's landmarks on every run.
// Sorted by this key, the file is the same whichever writer ran last.
export const orderLandmarks = <T extends { id: string }>(landmarks: readonly T[]): T[] =>
  landmarks.toSorted((left, right) => compareNaturally(left.id, right.id) || compareText(left.id, right.id));

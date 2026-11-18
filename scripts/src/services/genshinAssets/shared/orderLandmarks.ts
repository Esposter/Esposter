import { compareCodeUnits } from "#src/services/shared/compareCodeUnits";
import { compareNaturally } from "#src/services/shared/compareNaturally";

// A region file's landmarks in one total order: by their ids with each run of digits read as a number, and an id that
// Reads alike in digits (`5` and `05`) broken by its code units. Each writer of the file rebuilds it with its own kind
// Last, so two writers would move each other's landmarks on every run; sorted by this key, the file is the same whichever
// Writer ran last
export const orderLandmarks = <T extends { id: string }>(landmarks: readonly T[]): T[] =>
  landmarks.toSorted((left, right) => compareNaturally(left.id, right.id) || compareCodeUnits(left.id, right.id));

import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { compareNames } from "#src/services/oxlint/sorting/compareNames";

// The comparer of a set whose members sort by their numeric values when every one is a number, and by name otherwise
export const compareNumericOrName =
  (isNumeric: boolean) =>
  (left: SortingNode, right: SortingNode): number =>
    isNumeric ? Number(left.value) - Number(right.value) : compareNames(left.name, right.name);

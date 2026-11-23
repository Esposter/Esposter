import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Context, ESTree } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { splitRuns } from "#src/services/oxlint/sorting/splitRuns";

// Reports each run of an element list sorted on its own. A run ends after an element the check closes, and a hole or a
// Spread is no item, so it is left out of the run it closes
export const reportElementRuns = (
  context: Context,
  elements: ESTree.ArrayExpressionElement[],
  checkClosesRun: (element: ESTree.ArrayExpressionElement) => boolean,
  buildItem: (element: ESTree.Expression) => SortingItem,
): void => {
  for (const run of splitRuns(elements, checkClosesRun))
    reportUnsorted(
      context,
      run.flatMap((element): SortingItem[] =>
        element === null || element.type === "SpreadElement" ? [] : [buildItem(element)],
      ),
    );
};

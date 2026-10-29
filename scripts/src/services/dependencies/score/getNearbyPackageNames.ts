import type { ImportLine } from "#src/models/dependencies/score/ImportLine";

import { SHIM_LINE_WINDOW } from "#src/services/dependencies/score/constants";

// Every package imported within the window of a directive, since the directive is for the error at that import
export const getNearbyPackageNames = (importLines: ImportLine[], index: number): Set<string> =>
  new Set(
    importLines
      .filter((importLine) => Math.abs(importLine.index - index) <= SHIM_LINE_WINDOW)
      .map(({ packageName }) => packageName),
  );

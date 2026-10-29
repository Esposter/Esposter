import type { ImportLine } from "#src/models/dependencies/score/ImportLine";

import { SHIM_LINE_WINDOW } from "#src/services/dependencies/score/constants";

// Every package whose imported name is called or read from within the window of a cast. The lookbehind stands in for `\b`,
// Which a name starting with `$` never satisfies beside a space
export const getCalledPackageNames = (lines: string[], importLines: ImportLine[], index: number): Set<string> => {
  const windowText = lines.slice(Math.max(0, index - SHIM_LINE_WINDOW), index + SHIM_LINE_WINDOW + 1).join("\n");
  return new Set(
    importLines
      .filter(({ bindingNames }) =>
        bindingNames.some((bindingName) =>
          new RegExp(String.raw`(?<![\w$])${RegExp.escape(bindingName)}\s*[(.]`, "u").test(windowText),
        ),
      )
      .map(({ packageName }) => packageName),
  );
};

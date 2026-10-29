import type { ImportLine } from "#src/models/dependencies/score/ImportLine";

import { getBindingNames } from "#src/services/dependencies/score/getBindingNames";
import { getImportedPackageName } from "#src/services/dependencies/score/getImportedPackageName";

// A single-line import with the bindings it names. A multi-line import is not read, so a call beside it is not matched.
const IMPORT_REGEX = /^\s*import\s+(?:type\s+)?(?<bindings>.*?)\s*from\s*"(?<specifier>[^"]+)"/u;

export const readImportLines = (lines: string[]): ImportLine[] =>
  lines.flatMap((line, index) => {
    const groups = IMPORT_REGEX.exec(line)?.groups;
    if (groups?.specifier === undefined) return [];

    return [
      {
        bindingNames: getBindingNames(groups.bindings ?? ""),
        index,
        packageName: getImportedPackageName(groups.specifier),
      },
    ];
  });

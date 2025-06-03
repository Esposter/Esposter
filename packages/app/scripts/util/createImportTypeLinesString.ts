import type { ImportTypeLine } from "@@/scripts/models/ImportTypeLine";

import { EN_US_COMPARATOR } from "@/services/shared/constants";

export const createImportTypeLinesString = (lines: ImportTypeLine[]) =>
  lines.length === 0
    ? ""
    : `${lines
        .toSorted((a, b) => EN_US_COMPARATOR.compare(a.src, b.src))
        .map(
          ({ properties, src }) =>
            `import type { ${properties.toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)).join(",")} } from "${src}";`,
        )
        .join("\n")}\n\n`;

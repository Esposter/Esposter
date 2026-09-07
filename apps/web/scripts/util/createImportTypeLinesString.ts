import type { ImportTypeLine } from "@@/scripts/models/ImportTypeLine";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";

export const createImportTypeLinesString = (lines: ImportTypeLine[]) =>
  lines.length === 0
    ? ""
    : `${lines
        .toSorted((firstLine, secondLine) => EN_US_COMPARATOR.compare(firstLine.src, secondLine.src))
        .map(
          ({ properties, src }) =>
            `import type { ${properties.toSorted((firstProperty, secondProperty) => EN_US_COMPARATOR.compare(firstProperty, secondProperty)).join(",")} } from "${src}";`,
        )
        .join("\n")}\n\n`;

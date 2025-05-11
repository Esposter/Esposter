import type { ImportTypeLine } from "@@/scripts/models/ImportTypeLine";

export const createImportTypeLinesString = (lines: ImportTypeLine[]) =>
  lines.length === 0
    ? ""
    : `${lines
        .toSorted((a, b) => a.src.localeCompare(b.src))
        .map(
          ({ properties, src }) =>
            `import type { ${properties.toSorted((a, b) => a.localeCompare(b)).join(",")} } from "${src}";`,
        )
        .join("\n")}\n\n`;

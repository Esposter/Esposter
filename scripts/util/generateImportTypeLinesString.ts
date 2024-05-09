import type { ImportTypeLine } from "@/scripts/models/ImportTypeLine";

export const generateImportTypeLinesString = (lines: ImportTypeLine[]) =>
  lines.length === 0
    ? ""
    : `${lines
        .toSorted((a, b) => a.src.localeCompare(b.src))
        .map(
          ({ members, src }) =>
            `import type { ${members.toSorted((a, b) => a.localeCompare(b)).join(",")} } from "${src}";`,
        )
        .join("\n")}\n\n`;

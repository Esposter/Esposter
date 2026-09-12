import type { ColorPalette } from "#src/models/outdatedDependencies/ColorPalette";
import type { Mismatch } from "#src/models/outdatedDependencies/Mismatch";

import { printTable } from "#src/outdatedDependencies/printTable";

export const printMismatches = (mismatches: Mismatch[], color: ColorPalette): void => {
  if (mismatches.length === 0) return;

  console.log(
    color.yellow(
      "Catalog specifiers out of sync with lockfile resolutions — bump pnpm-workspace.yaml or run pnpm refresh:lockfile",
    ),
  );
  printTable(
    ["Package", "Specifier", "Resolved", "Group"],
    mismatches.map(({ group, pkg, resolved, specifier }) => [pkg, color.red(specifier), color.green(resolved), group]),
    color,
  );
};

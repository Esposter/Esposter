import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";
import type { Mismatch } from "@/checkDependencies/models/Mismatch";

import { printTable } from "@/checkDependencies/printTable";

export const printMismatches = (mismatches: Mismatch[], color: ColorPalette): void => {
  if (mismatches.length === 0) return;

  printTable(
    ["Package", "Specifier", "Resolved", "Group"],
    mismatches.map(({ group, pkg, resolved, specifier }) => [pkg, color.red(specifier), color.green(resolved), group]),
    color,
  );
};

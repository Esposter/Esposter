import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { printTable } from "#src/services/shared/printTable";

// A section is its heading over its table, and a section with no rows prints nothing, so an empty list is no section
export const printSection = (heading: string, headers: string[], rows: string[][], color: ColorPalette): void => {
  if (rows.length === 0) return;

  console.log(heading);
  printTable(headers, rows, color);
};

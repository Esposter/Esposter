import type { ColorPalette } from "#src/models/outdatedDependencies/ColorPalette";

import { createTableBorder } from "#src/services/outdatedDependencies/print/createTableBorder";
import { getVisibleLength } from "#src/services/outdatedDependencies/print/getVisibleLength";
import { padEndVisible } from "#src/services/outdatedDependencies/print/padEndVisible";

export const printTable = (headers: string[], rows: string[][], color: ColorPalette): void => {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => getVisibleLength(row[index] ?? ""))),
  );

  console.log(createTableBorder("┌", "┬", "┐", widths));
  console.log(`│ ${headers.map((header, index) => color.cyan(header.padEnd(widths[index] ?? 0))).join(" │ ")} │`);
  console.log(createTableBorder("├", "┼", "┤", widths));

  for (const [index, row] of rows.entries()) {
    const isLastRow = index === rows.length - 1;
    console.log(`│ ${row.map((cell, cellIndex) => padEndVisible(cell, widths[cellIndex] ?? 0)).join(" │ ")} │`);
    console.log(createTableBorder(isLastRow ? "└" : "├", isLastRow ? "┴" : "┼", isLastRow ? "┘" : "┤", widths));
  }
};

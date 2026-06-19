import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";

import { createTableBorder } from "@/checkDependencies/createTableBorder";
import { getVisibleLength } from "@/checkDependencies/getVisibleLength";
import { padEndVisible } from "@/checkDependencies/padEndVisible";

export const printTable = (headers: string[], rows: string[][], color: ColorPalette): void => {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => getVisibleLength(row[index] ?? ""))),
  );

  console.log(createTableBorder("┌", "┬", "┐", widths));
  console.log(`│ ${headers.map((header, index) => color.cyan(header.padEnd(widths[index] ?? 0))).join(" │ ")} │`);
  console.log(createTableBorder("├", "┼", "┤", widths));

  for (const [index, row] of rows.entries()) {
    console.log(`│ ${row.map((cell, cellIndex) => padEndVisible(cell, widths[cellIndex] ?? 0)).join(" │ ")} │`);
    console.log(
      createTableBorder(
        index === rows.length - 1 ? "└" : "├",
        index === rows.length - 1 ? "┴" : "┼",
        index === rows.length - 1 ? "┘" : "┤",
        widths,
      ),
    );
  }
};

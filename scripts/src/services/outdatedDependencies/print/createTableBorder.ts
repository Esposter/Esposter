export const createTableBorder = (left: string, separator: string, right: string, widths: number[]): string =>
  `${left}${widths.map((width) => "─".repeat(width + 2)).join(separator)}${right}`;

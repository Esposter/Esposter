import type { GcsimTableRow } from "#src/models/genshinAssets/kits/gcsim/GcsimTableRow";

import { readTableBody } from "#src/services/genshinAssets/kits/gcsim/readTableBody";

// Reads the rows of a module-scope table, `name = [][]float64{...}` or `name = []float64{...}`: each top-level item of a
// Two-dimensional table is a brace group, a row of cells, and each item of a one-dimensional table is a row of one cell
export const readGcsimTableRows = (lines: readonly string[], name: string): GcsimTableRow[] | undefined => {
  const body = readTableBody(lines, name);
  if (body === undefined) return undefined;
  const items: { line: number; text: string }[] = [];
  let depth = 0;
  let text = "";
  let line: number | undefined;
  for (const { char, line: characterLine } of body) {
    if (depth === 0 && char === ",") {
      if (line !== undefined) items.push({ line, text });
      text = "";
      line = undefined;
      continue;
    }
    if (char === "{") depth++;
    if (char === "}") depth--;
    if (line === undefined && char.trim() !== "") line = characterLine;
    text += char;
  }
  if (line !== undefined) items.push({ line, text });
  return items.map((item) => {
    const trimmed = item.text.trim();
    if (!trimmed.startsWith("{")) return { cells: [trimmed], line: item.line };
    return {
      cells: trimmed
        .slice(1, -1)
        .split(",")
        .map((cell) => cell.trim())
        .filter((cell) => cell !== ""),
      line: item.line,
    };
  });
};

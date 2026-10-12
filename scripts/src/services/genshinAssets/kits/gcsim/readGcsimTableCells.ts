import type { GcsimTableCite } from "#src/models/genshinAssets/kits/gcsim/GcsimTableCite";
import type { GcsimTableRow } from "#src/models/genshinAssets/kits/gcsim/GcsimTableRow";

interface TableCharacter {
  char: string;
  line: number;
}

// The characters of a table's literal between its outer braces, each with its line, or undefined where no such table
// Is declared
const readTableBody = (lines: readonly string[], name: string): TableCharacter[] | undefined => {
  const start = lines.findIndex((line) =>
    new RegExp(`^\\s*(?:var |const )?${name}\\s*(?:=|:=)\\s*\\[\\]`, "u").test(line),
  );
  if (start === -1) return undefined;
  const declaration = lines[start] ?? "";
  if (!declaration.includes("{")) return undefined;
  const body: TableCharacter[] = [];
  let depth = 0;
  for (let lineIndex = start; lineIndex < lines.length; lineIndex++) {
    const text = lines[lineIndex] ?? "";
    for (let character = lineIndex === start ? declaration.indexOf("{") : 0; character < text.length; character++) {
      const char = text.charAt(character);
      if (char === "{") {
        depth++;
        if (depth === 1) continue;
      }
      if (char === "}") {
        depth--;
        if (depth === 0) return body;
      }
      body.push({ char, line: lineIndex + 1 });
    }
    body.push({ char: "\n", line: lineIndex + 1 });
  }
  return undefined;
};

// Reads the rows of a module-scope table, `name = [][]float64{...}` or `name = []float64{...}`: each top-level item of a
// Two-dimensional table is a brace group, a row of cells, and each item of a one-dimensional table is a row of one cell
const readGcsimTableRows = (lines: readonly string[], name: string): GcsimTableRow[] | undefined => {
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

// A table index `name[i]` or `name[i][k]` in a line, where `i` and `k` are literals or the action's hit counter, which
// The caller gives as the action's own number, as `c.NormalCounter` is that for a normal attack
const TABLE_INDEX_REGEX = /(?<name>[A-Za-z_]\w*)\[(?<index>[^\]]+)\](?:\[(?<cell>[^\]]+)\])?/gu;

const readIndex = (text: string, counter: number | undefined): number | undefined => {
  if (text === "c.NormalCounter") return counter;
  return /^\d+$/u.test(text) ? Number(text) : undefined;
};

// The line with each module table index in it replaced by the cell it reads, each cited by the line of its row. A table
// Index that is neither a literal nor the counter, or a row or cell it does not have, is not evaluable and gives none,
// So nothing is guessed. A name no table declares is left in the line as it is
export const substituteGoTableCells = (
  text: string,
  lines: readonly string[],
  counter: number | undefined,
): undefined | { cites: GcsimTableCite[]; text: string } => {
  const cites: GcsimTableCite[] = [];
  let isEvaluable = true;
  const substituted = text.replace(TABLE_INDEX_REGEX, (match, name: string, indexText: string, cellText?: string) => {
    if (!isEvaluable) return match;
    const rows = readGcsimTableRows(lines, name);
    if (rows === undefined) return match;
    const rowIndex = readIndex(indexText, counter);
    const row = rowIndex === undefined ? undefined : rows[rowIndex];
    // A one-dimensional table's index is its row, and a two-dimensional one's cell is the index after its row
    const cellIndex = cellText === undefined ? 0 : readIndex(cellText, counter);
    const cell = cellIndex === undefined ? undefined : row?.cells[cellIndex];
    const value = cell === undefined ? undefined : Number(cell);
    if (row === undefined || value === undefined || !Number.isFinite(value)) {
      isEvaluable = false;
      return match;
    }
    cites.push({ line: row.line, value });
    return cell ?? match;
  });
  return isEvaluable ? { cites, text: substituted } : undefined;
};

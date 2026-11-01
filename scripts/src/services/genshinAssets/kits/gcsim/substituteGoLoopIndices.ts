import { MAX_ALTERNATIVES } from "#src/services/genshinAssets/kits/gcsim/constants";
import { readEnclosingLoopIndices } from "#src/services/genshinAssets/kits/gcsim/readEnclosingLoopIndices";
import { readGcsimTableRows } from "#src/services/genshinAssets/kits/gcsim/readGcsimTableRows";

// A module table indexed by a bare name, `name[i]`, `name[i][k]`
const TABLE_ROW_INDEX_REGEX = /(?<name>[A-Za-z_]\w*)\[\s*(?<index>[A-Za-z_]\w*)\s*\]/gu;

// The texts a line is with each `for` loop index of the loops it sits in, where the index picks a row of a module table,
// Replaced by a row of every table it indexes in turn, so a loop's constructor reads the row of each of its turns. The
// Index takes the rows the tables it indexes all have, and one text is given for each. A line indexing no table by a loop
// Index is its own one text, and so is one whose index picks a row of a table the module does not declare
export const substituteGoLoopIndices = (text: string, lines: readonly string[], lineIndex: number): string[] => {
  const loopIndices = new Set(readEnclosingLoopIndices(lines, lineIndex));
  const countMap = new Map<string, number>();
  for (const { groups } of text.matchAll(TABLE_ROW_INDEX_REGEX)) {
    const index = groups?.index;
    const rowCount = readGcsimTableRows(lines, groups?.name ?? "")?.length;
    if (index === undefined || !loopIndices.has(index) || rowCount === undefined) continue;
    countMap.set(index, Math.min(countMap.get(index) ?? rowCount, rowCount));
  }
  let texts = [text];
  for (const [index, rowCount] of countMap) {
    const indexRegex = new RegExp(`\\[\\s*${index}\\s*\\]`, "gu");
    texts = texts.flatMap((current) =>
      Array.from({ length: rowCount }, (_value, row) => current.replaceAll(indexRegex, `[${row}]`)),
    );
    if (texts.length > MAX_ALTERNATIVES) return [text];
  }
  return texts;
};

import type { AttackArea } from "genshin-world";

import { readConstructorText } from "#src/services/genshinAssets/kits/gcsim/readConstructorText";
import { readGcsimCitedArea } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedArea";
import { resolveGoLocals } from "#src/services/genshinAssets/kits/gcsim/resolveGoLocals";
import { substituteGoTableCells } from "#src/services/genshinAssets/kits/gcsim/substituteGoTableCells";

// The area a cited constructor gives, read across its lines, with its line: the row of the table whose cell is the
// Area's radius where the constructor reads a table, else the first table cell it reads, else the constructor's own line.
// A table index that is not evaluable gives no area
export const readCitedArea = (
  lines: readonly string[],
  lineIndex: number,
  file: string,
  counter: number | undefined,
  targetingArea: AttackArea,
): undefined | { area: AttackArea; line: number } => {
  const constructorText = readConstructorText(lines, lineIndex);
  // The arguments are read with the locals they name resolved, the constructor's own name and its left side left as they are
  const open = constructorText.indexOf("(");
  if (open === -1) return undefined;
  const argumentText = resolveGoLocals(constructorText.slice(open + 1), lines, lineIndex);
  if (argumentText === undefined) return undefined;
  const table = substituteGoTableCells(`${constructorText.slice(0, open + 1)}${argumentText}`, lines, counter);
  if (table === undefined) return undefined;
  const area = readGcsimCitedArea(table.text, file, targetingArea);
  if (area === undefined) return undefined;
  const cite = table.cites.find(({ value }) => value === area.radius) ?? table.cites[0];
  return { area, line: cite?.line ?? lineIndex + 1 };
};

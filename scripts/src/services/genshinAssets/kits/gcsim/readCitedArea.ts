import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { AttackArea } from "genshin-world";

import { readConstructorText } from "#src/services/genshinAssets/kits/gcsim/readConstructorText";
import { readGcsimCitedArea } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedArea";
import { resolveGoLocals } from "#src/services/genshinAssets/kits/gcsim/resolveGoLocals";
import { substituteGoConstants } from "#src/services/genshinAssets/kits/gcsim/substituteGoConstants";
import { substituteGoLoopIndices } from "#src/services/genshinAssets/kits/gcsim/substituteGoLoopIndices";
import { substituteGoTableCells } from "#src/services/genshinAssets/kits/gcsim/substituteGoTableCells";

// The areas a cited constructor may give, read across its lines, each with its line: the row of the table whose cell is
// The constructor's size where the constructor reads a table, else the first table cell it reads, else the constructor's own
// Line. A local bound more than once, or a table indexed by the index of the loop the constructor sits in, gives an area
// For each value it may hold, in the order they are written, so the overlay picks the one it cites. A table index that is
// Not evaluable gives no area. A size named by a package constant that is a number reads as that number
export const readCitedArea = (
  lines: readonly string[],
  lineIndex: number,
  file: string,
  counter: number | undefined,
  targetingArea: AttackArea,
  constantMap: ReadonlyMap<string, GoConstant>,
): { area: AttackArea; line: number }[] => {
  const constructorText = readConstructorText(lines, lineIndex);
  // The arguments are read with the locals they name resolved, the constructor's own name and its left side left as they are
  const open = constructorText.indexOf("(");
  if (open === -1) return [];
  const argumentTexts = resolveGoLocals(constructorText.slice(open + 1), lines, lineIndex);
  if (argumentTexts === undefined) return [];
  const citedAreas: { area: AttackArea; line: number }[] = [];
  for (const argumentText of argumentTexts)
    for (const text of substituteGoLoopIndices(
      `${constructorText.slice(0, open + 1)}${argumentText}`,
      lines,
      lineIndex,
    )) {
      const table = substituteGoTableCells(text, lines, counter);
      if (table === undefined) continue;
      const cited = readGcsimCitedArea(substituteGoConstants(table.text, constantMap), file, targetingArea);
      if (cited === undefined) continue;
      const cite = table.cites.find(({ value }) => cited.sizes.includes(value)) ?? table.cites[0];
      citedAreas.push({ area: cited.area, line: cite?.line ?? lineIndex + 1 });
    }
  return citedAreas;
};

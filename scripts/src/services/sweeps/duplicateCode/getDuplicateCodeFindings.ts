import type { DuplicateCodeClone } from "#src/models/sweeps/duplicateCode/DuplicateCodeClone";
import type { DuplicateCodeFinding } from "#src/models/sweeps/duplicateCode/DuplicateCodeFinding";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { checkIsRangeFree } from "#src/services/sweeps/duplicateCode/checkIsRangeFree";
import { checkIsRegisterFile } from "#src/services/sweeps/duplicateCode/checkIsRegisterFile";
import { getNonDataRowLines } from "#src/services/sweeps/duplicateCode/getNonDataRowLines";
import { getNonDeclarationLines } from "#src/services/sweeps/duplicateCode/getNonDeclarationLines";
import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";
import { getNonRecordRowLines } from "#src/services/sweeps/duplicateCode/getNonRecordRowLines";
import { getOrCreate } from "@esposter/shared";
import { relative, sep } from "node:path";

// Each reader gives the code lines of a file once one kind of non-logic is read as data. A clone free of code under
// Any reader is a copy of that non-logic alone: imports, a declaration or wiring, the rows of an enum-keyed record, or
// The numeric and colour rows of a table.
const NON_LOGIC_LINE_READERS: ((text: string) => Set<number>)[] = [
  getNonImportLines,
  getNonDeclarationLines,
  getNonRecordRowLines,
  getNonDataRowLines,
];

const getPath = ({ sourceId, start }: DuplicateCodeClone["duplicationA"]) =>
  `${relative(REPOSITORY_ROOT, sourceId).split(sep).join("/")}:${start.line}`;

// Every clone jscpd found, as a finding, except the ones that are non-logic in both files, and the ones a Claude plugin
// Cannot share: a clone across two plugins, since each installs standalone, and a clone of two register files, since the
// Engine keeps each `$` call in the file that makes it. `readSource` and `readPluginRoot` are passed in so the filter
// Reads the same text the clone was found in, and a test can supply both.
export const getDuplicateCodeFindings = (
  clones: DuplicateCodeClone[],
  readSource: (sourceId: string) => string,
  readPluginRoot: (sourceId: string) => string | undefined = () => undefined,
): DuplicateCodeFinding[] => {
  const readNonLogicLinesReaders = NON_LOGIC_LINE_READERS.map((readNonLogicLines) => {
    const sourceIdNonLogicLinesMap = new Map<string, Set<number>>();
    return (sourceId: string) =>
      getOrCreate(sourceIdNonLogicLinesMap, sourceId, () => readNonLogicLines(readSource(sourceId)));
  });
  const findings: DuplicateCodeFinding[] = [];
  for (const { duplicationA, duplicationB } of clones) {
    const pluginRootA = readPluginRoot(duplicationA.sourceId);
    const pluginRootB = readPluginRoot(duplicationB.sourceId);
    if (pluginRootA && pluginRootB && pluginRootA !== pluginRootB) continue;
    if (
      checkIsRegisterFile(duplicationA.sourceId, pluginRootA) &&
      checkIsRegisterFile(duplicationB.sourceId, pluginRootB)
    )
      continue;

    const isNonLogic = readNonLogicLinesReaders.some(
      (readNonLogicLines) =>
        checkIsRangeFree(duplicationA.start.line, duplicationA.end.line, readNonLogicLines(duplicationA.sourceId)) &&
        checkIsRangeFree(duplicationB.start.line, duplicationB.end.line, readNonLogicLines(duplicationB.sourceId)),
    );
    if (isNonLogic) continue;

    findings.push({
      lines: duplicationA.end.line - duplicationA.start.line + 1,
      paths: [getPath(duplicationA), getPath(duplicationB)],
    });
  }
  return findings.toSorted((firstFinding, secondFinding) => secondFinding.lines - firstFinding.lines);
};

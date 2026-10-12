import type { DuplicateCodeClone } from "#src/models/sweeps/duplicateCode/DuplicateCodeClone";
import type { DuplicateCodeFinding } from "#src/models/sweeps/duplicateCode/DuplicateCodeFinding";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { checkIsRangeFree } from "#src/services/sweeps/duplicateCode/checkIsRangeFree";
import { checkIsRegisterFile } from "#src/services/sweeps/duplicateCode/checkIsRegisterFile";
import { getDataRowLines } from "#src/services/sweeps/duplicateCode/getDataRowLines";
import { getDeclarationLines } from "#src/services/sweeps/duplicateCode/getDeclarationLines";
import { getLeadingImportLines } from "#src/services/sweeps/duplicateCode/getLeadingImportLines";
import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";
import { getRecordRowLines } from "#src/services/sweeps/duplicateCode/getRecordRowLines";
import { getOrCreate } from "@esposter/shared";
import { relative, sep } from "node:path";

// Each file is read once per reader however many clones it is in
const memoize = <TValue>(read: (sourceId: string) => TValue) => {
  const sourceIdValueMap = new Map<string, TValue>();
  return (sourceId: string) => getOrCreate(sourceIdValueMap, sourceId, () => read(sourceId));
};

// Each reader gives the data lines of a file: one kind of non-logic read as data, a declaration or wiring, the rows of an
// Enum-keyed record, or the numeric and colour rows of a table. A clone free of code under any reader is a copy of that
// Non-logic alone, where a file's code under a reader is every line that is neither an import nor one of its data lines
const DATA_LINE_READERS: ((text: string) => Set<number>)[] = [getDeclarationLines, getRecordRowLines, getDataRowLines];

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
  const readNonImportLines = memoize((sourceId) => getNonImportLines(readSource(sourceId)));
  const readLeadingImportLines = memoize((sourceId) => getLeadingImportLines(readSource(sourceId)));
  const readPluginRootOnce = memoize(readPluginRoot);
  const readCodeLinesReaders = [
    readNonImportLines,
    ...DATA_LINE_READERS.map((readDataLines) =>
      memoize((sourceId) => {
        const dataLines = readDataLines(readSource(sourceId));
        return new Set([...readNonImportLines(sourceId)].filter((line) => !dataLines.has(line)));
      }),
    ),
  ];
  const findings: DuplicateCodeFinding[] = [];
  for (const { duplicationA, duplicationB } of clones) {
    const pluginRootA = readPluginRootOnce(duplicationA.sourceId);
    const pluginRootB = readPluginRootOnce(duplicationB.sourceId);
    if (pluginRootA && pluginRootB && pluginRootA !== pluginRootB) continue;
    if (
      checkIsRegisterFile(duplicationA.sourceId, pluginRootA) &&
      checkIsRegisterFile(duplicationB.sourceId, pluginRootB)
    )
      continue;
    // Two files sharing an import block run from it into their bodies, so a clone reaching a leading import line is a
    // Shared block rather than a copied body, and no clone can include an import line.
    if (
      !checkIsRangeFree(
        duplicationA.start.line,
        duplicationA.end.line,
        readLeadingImportLines(duplicationA.sourceId),
      ) ||
      !checkIsRangeFree(duplicationB.start.line, duplicationB.end.line, readLeadingImportLines(duplicationB.sourceId))
    )
      continue;

    const isNonLogic = readCodeLinesReaders.some(
      (readCodeLines) =>
        checkIsRangeFree(duplicationA.start.line, duplicationA.end.line, readCodeLines(duplicationA.sourceId)) &&
        checkIsRangeFree(duplicationB.start.line, duplicationB.end.line, readCodeLines(duplicationB.sourceId)),
    );
    if (isNonLogic) continue;

    findings.push({
      lines: duplicationA.end.line - duplicationA.start.line + 1,
      paths: [getPath(duplicationA), getPath(duplicationB)],
    });
  }
  return findings.toSorted((firstFinding, secondFinding) => secondFinding.lines - firstFinding.lines);
};

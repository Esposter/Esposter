import type { DuplicateCodeFinding } from "#src/models/sweeps/duplicateCode/DuplicateCodeFinding";
import type { detectClones } from "jscpd";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { checkIsImportOnlyRange } from "#src/services/sweeps/duplicateCode/checkIsImportOnlyRange";
import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";
import { getOrCreate } from "@esposter/shared";
import { relative, sep } from "node:path";

type DuplicateCodeClone = Awaited<ReturnType<typeof detectClones>>[number];

// Every clone jscpd found, as a finding, except the ones whose lines are import declarations in both files. `readSource`
// Is passed in so the filter reads the same text the clone was found in, and a test can supply it.
export const getDuplicateCodeFindings = (
  clones: DuplicateCodeClone[],
  readSource: (sourceId: string) => string,
): DuplicateCodeFinding[] => {
  const sourceIdNonImportLinesMap = new Map<string, Set<number>>();
  const readNonImportLines = (sourceId: string) =>
    getOrCreate(sourceIdNonImportLinesMap, sourceId, () => getNonImportLines(readSource(sourceId)));
  const getPath = ({ sourceId, start }: DuplicateCodeClone["duplicationA"]) =>
    `${relative(REPOSITORY_ROOT, sourceId).split(sep).join("/")}:${start.line}`;
  const findings: DuplicateCodeFinding[] = [];
  for (const { duplicationA, duplicationB } of clones) {
    const isImportOnly =
      checkIsImportOnlyRange(
        duplicationA.start.line,
        duplicationA.end.line,
        readNonImportLines(duplicationA.sourceId),
      ) &&
      checkIsImportOnlyRange(duplicationB.start.line, duplicationB.end.line, readNonImportLines(duplicationB.sourceId));
    if (isImportOnly) continue;

    findings.push({
      lines: duplicationA.end.line - duplicationA.start.line + 1,
      paths: [getPath(duplicationA), getPath(duplicationB)],
    });
  }
  return findings.toSorted((firstFinding, secondFinding) => secondFinding.lines - firstFinding.lines);
};

import { getAreaUnitFindings } from "#src/services/precheck/getAreaUnitFindings";
import { getAreaUnitSizeFindings } from "#src/services/precheck/getAreaUnitSizeFindings";
import { getLedgerUnitsFindings } from "#src/services/precheck/getLedgerUnitsFindings";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { getUnitFiles } from "#src/services/sweeps/ledgerCoverage/getUnitFiles";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readFileSize } from "#src/services/sweeps/ledgerCoverage/readFileSize";
import { readLedgerAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerAreas";
import { readAreaFileUnits } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";
import { readQuestionUnits } from "#src/services/sweeps/ledgerCoverage/readQuestionUnits";
import { readTrackedFiles } from "#src/services/sweeps/ledgerCoverage/readTrackedFiles";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every notes table against the tree in this checkout, read as the working tree holds them: a derived ledger's against
// Its listing, and a question's own file and each of its `<question>/<area>.md` files against the question's cells. Each
// Area unit is held to the tracked files too, so a path a rename or a removal left behind is named as it stands, and to
// The cap a pass reads it in full under
export const checkLedgerUnits = (): string[] => {
  const areas = readLedgerAreas();
  const unitsByArea = Object.fromEntries(areas.map((area) => [area, readAreaFileUnits(area)]));
  const trackedFiles = readTrackedFiles(readVendoredSkillNames());
  const questionUnitsByFile = Object.fromEntries(
    Object.entries(readQuestionUnits()).flatMap(([question, units]) =>
      [question, ...areas.map((area) => `${question}/${area}`)].map((file): [string, () => string[]] => [
        file,
        () => units,
      ]),
    ),
  );
  return [
    ...getLedgerUnitsFindings(
      (ledger) => {
        const path = join(REPOSITORY_ROOT, LEDGER_DIRECTORY, `${ledger}.md`);
        return existsSync(path) ? readFileSync(path, "utf8") : "";
      },
      { ...questionUnitsByFile, ...LedgerUnitsMap },
    ),
    ...getAreaUnitFindings(unitsByArea, trackedFiles),
    ...getAreaUnitSizeFindings(
      unitsByArea,
      getUnitFiles(Object.values(unitsByArea).flat(), trackedFiles),
      readFileSize,
    ),
  ];
};

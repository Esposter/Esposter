import { getLedgerUnitsFindings } from "#src/services/precheck/getLedgerUnitsFindings";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readLedgerAreas } from "#src/services/sweeps/ledgerCoverage/readLedgerAreas";
import { readQuestionUnits } from "#src/services/sweeps/ledgerCoverage/readQuestionUnits";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every notes table against the tree in this checkout, read as the working tree holds them: a derived ledger's against
// Its listing, and a question's own file and each of its `<question>/<area>.md` files against the question's cells
export const checkLedgerUnits = (): string[] => {
  const areas = readLedgerAreas();
  const questionUnitsByFile = Object.fromEntries(
    Object.entries(readQuestionUnits()).flatMap(([question, units]) =>
      [question, ...areas.map((area) => `${question}/${area}`)].map((file): [string, () => string[]] => [
        file,
        () => units,
      ]),
    ),
  );
  return getLedgerUnitsFindings(
    (ledger) => {
      const path = join(REPOSITORY_ROOT, LEDGER_DIRECTORY, `${ledger}.md`);
      return existsSync(path) ? readFileSync(path, "utf8") : "";
    },
    { ...questionUnitsByFile, ...LedgerUnitsMap },
  );
};

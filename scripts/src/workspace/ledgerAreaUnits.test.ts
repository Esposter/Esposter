import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";
import { readOpenspecFolderUnits } from "#src/services/sweeps/ledgerCoverage/readOpenspecFolderUnits";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const readAreaUnits = (ledger: string, area: string): string[] =>
  readLedgerUnits(readFileSync(join(REPOSITORY_ROOT, LEDGER_DIRECTORY, ledger, `${area}.md`), "utf8"))
    .map((unit) => normalizeLedgerUnit(unit))
    .toSorted();

/**
 * The invariants ledger names each area's units, and the quality, security and write-once ledgers read the same code
 * against the same units, so each copy's unit column holds that list. A copy that drifts from it reads a different
 * part of the tree under the same area name, and the sweep's coverage for the area stops meaning one thing.
 */
describe("ledgerAreaUnits", () => {
  const INVARIANTS_LEDGER = "invariants";
  const COPY_LEDGERS = ["quality", "security", "write-once"];
  const areas = readdirSync(join(REPOSITORY_ROOT, LEDGER_DIRECTORY, INVARIANTS_LEDGER))
    .filter((filename) => filename.endsWith(".md") && filename !== "README.md")
    .map((filename) => filename.slice(0, -".md".length));
  // The quality and security tooling tables also list the openspec folders the tree derives, which no invariants unit names
  const openspecUnits = new Set(readOpenspecFolderUnits().map((unit) => normalizeLedgerUnit(unit)));

  test.each(COPY_LEDGERS.flatMap((ledger) => areas.map((area) => ({ area, ledger }))))(
    "%s/%s holds invariants' units for the area",
    ({ area, ledger }) => {
      expect.hasAssertions();

      const copyUnits = readAreaUnits(ledger, area).filter((unit) => !openspecUnits.has(unit));

      expect(copyUnits).toStrictEqual(readAreaUnits(INVARIANTS_LEDGER, area));
    },
  );
});

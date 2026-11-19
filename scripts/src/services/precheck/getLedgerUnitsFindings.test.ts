import { getLedgerUnitsFindings } from "#src/services/precheck/getLedgerUnitsFindings";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";
import { describe, expect, test } from "vitest";

const getRow = (unit: string) => `| ${unit} | ${OPEN_CELL} |  |\n`;

describe(getLedgerUnitsFindings, () => {
  const header = `| Unit | Swept | Notes |
| ---- | ----- | ----- |
`;

  test("finds nothing when each derived ledger holds a row for every unit the tree derives", () => {
    expect.hasAssertions();

    expect(getLedgerUnitsFindings(() => `${header}${getRow("`a`")}`, { derived: () => ["`a`"] })).toStrictEqual([]);
  });

  test("names a derived ledger that lacks a row the tree derives, with the command that writes it", () => {
    expect.hasAssertions();

    expect(getLedgerUnitsFindings(() => header, { derived: () => ["`a`"] })).toStrictEqual([
      `out of sync ${LEDGER_DIRECTORY}/derived.md`,
      "fix: pnpm ai:sweep:ledger-coverage",
    ]);
  });

  test("names only the derived ledger that is out of sync", () => {
    expect.hasAssertions();

    expect(
      getLedgerUnitsFindings((ledger) => (ledger === "complete" ? `${header}${getRow("`a`")}` : header), {
        complete: () => ["`a`"],
        missing: () => ["`a`"],
      }),
    ).toStrictEqual([`out of sync ${LEDGER_DIRECTORY}/missing.md`, "fix: pnpm ai:sweep:ledger-coverage"]);
  });
});

import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";
import { syncLedgerUnits } from "#src/services/sweeps/ledgerCoverage/syncLedgerUnits";
import { describe, expect, test } from "vitest";

const getRow = (unit: string, swept: string, notes = "") =>
  `| ${unit.padEnd(6)} | ${swept.padEnd(10)} | ${notes.padEnd(5)} |\n`;

describe(syncLedgerUnits, () => {
  const header = `| Unit   | Swept      | Notes |
| ------ | ---------- | ----- |
`;
  const date = new Date(0).toISOString().slice(0, 10);

  test("opens a row for a unit the table lacks, in name order", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(`${header}${getRow("`c`", date)}`, ["`c`", "`a`"])).toBe(
      `${header}${getRow("`a`", OPEN_CELL)}${getRow("`c`", date)}`,
    );
  });

  test("orders a name before its own extension", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(header, ["`a-b`", "`a`"])).toBe(
      `${header}${getRow("`a`", OPEN_CELL)}${getRow("`a-b`", OPEN_CELL)}`,
    );
  });

  test("drops a row whose unit is gone and keeps the others' cells", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(`${header}${getRow("`a`", date, "notes")}${getRow("`c`", OPEN_CELL)}`, ["`a`"])).toBe(
      `${header}${getRow("`a`", date, "notes")}`,
    );
  });

  test("leaves the prose after the table alone", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(`${header}${getRow("`a`", date)}\na\n`, ["`a`"])).toBe(
      `${header}${getRow("`a`", date)}\na\n`,
    );
  });

  test("returns a text with no table unchanged", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits("a\n", ["`a`"])).toBe("a\n");
  });
});

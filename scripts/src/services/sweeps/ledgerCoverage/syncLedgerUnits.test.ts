import { syncLedgerUnits } from "#src/services/sweeps/ledgerCoverage/syncLedgerUnits";
import { describe, expect, test } from "vitest";

const getRow = (unit: string, swept: string, notes = "") =>
  `| ${unit.padEnd(6)} | ${swept.padEnd(10)} | ${notes.padEnd(5)} |\n`;

describe(syncLedgerUnits, () => {
  const header = `| Unit   | Swept      | Notes |
| ------ | ---------- | ----- |
`;
  const date = new Date(0).toISOString().slice(0, "1970-01-01".length);

  test("opens a row for a unit the table lacks, in name order", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(`${header}${getRow("`c`", date)}`, ["`c`", "`a`"])).toBe(
      `${header}${getRow("`a`", "—")}${getRow("`c`", date)}`,
    );
  });

  test("orders a name before its own extension", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(header, ["`a-b`", "`a`"])).toBe(`${header}${getRow("`a`", "—")}${getRow("`a-b`", "—")}`);
  });

  test("drops a row whose unit is gone and keeps the others' cells", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(`${header}${getRow("`a`", date, "note")}${getRow("`c`", "—")}`, ["`a`"])).toBe(
      `${header}${getRow("`a`", date, "note")}`,
    );
  });

  test("leaves the prose after the table alone", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits(`${header}${getRow("`a`", date)}\nProse\n`, ["`a`"])).toBe(
      `${header}${getRow("`a`", date)}\nProse\n`,
    );
  });

  test("returns a text with no table unchanged", () => {
    expect.hasAssertions();

    expect(syncLedgerUnits("Prose\n", ["`a`"])).toBe("Prose\n");
  });
});

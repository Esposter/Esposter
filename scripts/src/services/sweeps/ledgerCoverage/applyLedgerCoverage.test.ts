import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";
import type { LedgerFile } from "#src/models/sweeps/ledgerCoverage/LedgerFile";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";
import { applyLedgerCoverage } from "#src/services/sweeps/ledgerCoverage/applyLedgerCoverage";
import { describe, expect, test } from "vitest";

const getText = (unit: string) =>
  `| Unit | Swept |
| ---- | ----- |
| \`${unit}\` | ${OPEN_CELL} |
`;
const getFile = (ledger: string, unit: string): LedgerFile => ({
  ledger,
  ledgerPath: `.agents/ledgers/${ledger}.md`,
  text: getText(unit),
});

describe(applyLedgerCoverage, () => {
  const date = "1970-01-01";
  const getEvent = (ledger: string, unit?: string, type: LedgerEventType = LedgerEventType.Ledger): LedgerEvent => ({
    date,
    ledger,
    model: "",
    type,
    unit,
  });

  test("matches a trailer that names a row of the file it is for", () => {
    expect.hasAssertions();

    const event = getEvent("a/b", "c");
    const { unmatched } = applyLedgerCoverage([event], [getFile("a/b", "c")]);

    expect(unmatched).toStrictEqual([]);
  });

  test("matches a trailer that names a row of another file under its folder", () => {
    expect.hasAssertions();

    // A folder ledger's trailer is in scope for every area file in it, and its unit is a row in exactly one of them
    const event = getEvent("a", "c");
    const { unmatched } = applyLedgerCoverage([event], [getFile("a/b", "x"), getFile("a/d", "c")]);

    expect(unmatched).toStrictEqual([]);
  });

  test("reports a trailer whose unit no row of any file names", () => {
    expect.hasAssertions();

    // A shortened or reworded unit is the case this reports: it names nothing, so its row would stay open
    const event = getEvent("a/b", "c d");
    const { unmatched } = applyLedgerCoverage([event], [getFile("a/b", "c"), getFile("a/d", "c d e")]);

    expect(unmatched).toStrictEqual([event]);
  });

  test("reports a trailer naming a ledger that has no file", () => {
    expect.hasAssertions();

    const event = getEvent("a/missing", "c");
    const { unmatched } = applyLedgerCoverage([event], [getFile("a/b", "c")]);

    expect(unmatched).toStrictEqual([event]);
  });

  test("never reports a reopen that names no unit", () => {
    expect.hasAssertions();

    const event = getEvent("a/missing", undefined, LedgerEventType.Reopens);
    const { unmatched } = applyLedgerCoverage([event], [getFile("a/b", "c")]);

    expect(unmatched).toStrictEqual([]);
  });
});

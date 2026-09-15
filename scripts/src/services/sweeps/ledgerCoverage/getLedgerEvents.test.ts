import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { describe, expect, test } from "vitest";

describe(getLedgerEvents, () => {
  const date = new Date(0).toISOString().slice(0, "1970-01-01".length);
  const getRecord = (body: string) => `${date}${FIELD_SEPARATOR}${body}${RECORD_SEPARATOR}`;

  test("reads a sweep trailer as the ledger, the unit and the commit date", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord("refactor(a): sweep a\n\nLedger: a/b | `c`\n"))).toStrictEqual([
      { date, ledger: "a/b", type: LedgerEventType.Ledger, unit: "`c`" },
    ]);
  });

  test("reads a reopen naming a whole ledger", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord("docs(a): a rule changes\n\nReopens: a\n"))).toStrictEqual([
      { date, ledger: "a", type: LedgerEventType.Reopens, unit: undefined },
    ]);
  });

  test("keeps every trailer of one commit in order", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord("a\n\nLedger: a | `b`\nLedger: a | `c`\n"))).toStrictEqual([
      { date, ledger: "a", type: LedgerEventType.Ledger, unit: "`b`" },
      { date, ledger: "a", type: LedgerEventType.Ledger, unit: "`c`" },
    ]);
  });

  // The free-form trailers older commits carry name no row, and a value with no ledger names nothing
  test("skips a sweep trailer that names no unit", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord("a\n\nLedger: `app/pages` — the rest.\nLedger:\n"))).toStrictEqual([]);
  });
});

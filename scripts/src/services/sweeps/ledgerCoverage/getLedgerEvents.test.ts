import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { TRAILER_VALUE_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { describe, expect, test } from "vitest";

describe(getLedgerEvents, () => {
  const date = new Date(0).toISOString().slice(0, 10);
  const getRecord = (body: string) => `${date}${FIELD_SEPARATOR}${body}${RECORD_SEPARATOR}`;

  test("reads a sweep trailer as the ledger, the unit and the commit date", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord(`${LedgerEventType.Ledger}: a/b${TRAILER_VALUE_SEPARATOR}\`c\`\n`))).toStrictEqual(
      [{ date, ledger: "a/b", model: "", type: LedgerEventType.Ledger, unit: "`c`" }],
    );
  });

  test("reads a reopen naming a whole ledger", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord(`${LedgerEventType.Reopens}: a\n`))).toStrictEqual([
      { date, ledger: "a", model: "", type: LedgerEventType.Reopens, unit: undefined },
    ]);
  });

  test("keeps every trailer of one commit in order", () => {
    expect.hasAssertions();

    const body = `${LedgerEventType.Ledger}: a${TRAILER_VALUE_SEPARATOR}\`b\`\n${LedgerEventType.Ledger}: a${TRAILER_VALUE_SEPARATOR}\`c\`\n`;

    expect(getLedgerEvents(getRecord(body))).toStrictEqual([
      { date, ledger: "a", model: "", type: LedgerEventType.Ledger, unit: "`b`" },
      { date, ledger: "a", model: "", type: LedgerEventType.Ledger, unit: "`c`" },
    ]);
  });

  test("reads the model from the commit's co-author trailer", () => {
    expect.hasAssertions();

    const model = "a";
    const body = `${LedgerEventType.Ledger}: b${TRAILER_VALUE_SEPARATOR}\`c\`

Co-Authored-By: Claude ${model} (d) <e>
`;

    expect(getLedgerEvents(getRecord(body))).toStrictEqual([
      { date, ledger: "b", model, type: LedgerEventType.Ledger, unit: "`c`" },
    ]);
  });

  // The free-form trailers older commits carry name no row, and a value with no ledger names nothing
  test("skips a sweep trailer that names no unit", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord(`${LedgerEventType.Ledger}: \`a\`\n${LedgerEventType.Ledger}:\n`))).toStrictEqual(
      [],
    );
  });
});

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { SWEPT_CELL_SEPARATOR, TRAILER_VALUE_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { DAY_AFTER_EPOCH_DATE, EPOCH_DATE } from "#src/services/sweeps/ledgerCoverage/constants.test";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { describe, expect, test } from "vitest";

describe(getLedgerEvents, () => {
  const date = EPOCH_DATE;
  const areas: string[] = [];
  const getRecord = (body: string) => `${date}${FIELD_SEPARATOR}${body}${RECORD_SEPARATOR}`;

  test("reads a sweep trailer as the ledger, the unit and the commit date", () => {
    expect.hasAssertions();

    expect(
      getLedgerEvents(getRecord(`${LedgerEventType.Ledger}: a/b${TRAILER_VALUE_SEPARATOR}\`c\`\n`), areas),
    ).toStrictEqual([{ date, ledger: "a/b", model: "", type: LedgerEventType.Ledger, unit: "c" }]);
  });

  test("reads a reopen naming a whole ledger", () => {
    expect.hasAssertions();

    expect(getLedgerEvents(getRecord(`${LedgerEventType.Reopens}: a\n`), areas)).toStrictEqual([
      { date, ledger: "a", model: "", type: LedgerEventType.Reopens, unit: undefined },
    ]);
  });

  test("keeps every trailer of one commit in order", () => {
    expect.hasAssertions();

    const body = `${LedgerEventType.Ledger}: a${TRAILER_VALUE_SEPARATOR}\`b\`\n${LedgerEventType.Ledger}: a${TRAILER_VALUE_SEPARATOR}\`c\`\n`;

    expect(getLedgerEvents(getRecord(body), areas)).toStrictEqual([
      { date, ledger: "a", model: "", type: LedgerEventType.Ledger, unit: "b" },
      { date, ledger: "a", model: "", type: LedgerEventType.Ledger, unit: "c" },
    ]);
  });

  test("reads the model from the commit's co-author trailer", () => {
    expect.hasAssertions();

    const model = "a";
    const body = `${LedgerEventType.Ledger}: b${TRAILER_VALUE_SEPARATOR}\`c\`

Co-Authored-By: Claude ${model} (d) <e>
`;

    expect(getLedgerEvents(getRecord(body), areas)).toStrictEqual([
      { date, ledger: "b", model, type: LedgerEventType.Ledger, unit: "c" },
    ]);
  });

  // The free-form trailers older commits carry name no row, and a value with no ledger names nothing
  test("skips a sweep trailer that names no unit", () => {
    expect.hasAssertions();

    expect(
      getLedgerEvents(getRecord(`${LedgerEventType.Ledger}: \`a\`\n${LedgerEventType.Ledger}:\n`), areas),
    ).toStrictEqual([]);
  });

  // A pass no trailer recorded is carried by a later commit, which names the date and the model of the pass itself
  test("reads a carried trailer as the date and model it names", () => {
    expect.hasAssertions();

    const carriedDate = DAY_AFTER_EPOCH_DATE;
    const model = "d";
    const body = `${LedgerEventType.Ledger}: a${TRAILER_VALUE_SEPARATOR}b${TRAILER_VALUE_SEPARATOR}${carriedDate}${SWEPT_CELL_SEPARATOR}${model}
`;

    expect(getLedgerEvents(getRecord(body), areas)).toStrictEqual([
      { date: carriedDate, ledger: "a", model, type: LedgerEventType.Ledger, unit: "b" },
    ]);
  });

  test("skips a carried trailer whose date is not a date", () => {
    expect.hasAssertions();

    const body = `${LedgerEventType.Ledger}: a${TRAILER_VALUE_SEPARATOR}b${TRAILER_VALUE_SEPARATOR}c
`;

    expect(getLedgerEvents(getRecord(body), areas)).toStrictEqual([]);
  });

  // A trailer naming an area of a question dates the question's cell, since an area is a grouping and not a ledger
  test("reads a trailer naming a question's area as the question", () => {
    expect.hasAssertions();

    expect(
      getLedgerEvents(getRecord(`${LedgerEventType.Ledger}: a/b${TRAILER_VALUE_SEPARATOR}\`c\`\n`), ["b"]),
    ).toStrictEqual([{ date, ledger: "a", model: "", type: LedgerEventType.Ledger, unit: "c" }]);
  });

  test("reads a sample as its ledger and the defects it found", () => {
    expect.hasAssertions();

    const body = `${LedgerEventType.Sampled}: a${TRAILER_VALUE_SEPARATOR}30${SWEPT_CELL_SEPARATOR}0
`;

    expect(getLedgerEvents(getRecord(body), areas)).toStrictEqual([
      { date, defects: 0, ledger: "a", model: "", type: LedgerEventType.Sampled },
    ]);
  });

  test("skips a sample that names no defect count", () => {
    expect.hasAssertions();

    expect(
      getLedgerEvents(
        getRecord(`${LedgerEventType.Sampled}: a
`),
        areas,
      ),
    ).toStrictEqual([]);
  });
});

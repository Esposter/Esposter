import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";
import { describe, expect, test } from "vitest";

describe(applyLedgerEvents, () => {
  const ledger = "a/b";
  const unit = "`c`";
  const earlier = new Date(0).toISOString().slice(0, 10);
  const later = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString().slice(0, 10);
  const getText = (swept: string) =>
    `| Unit   | Swept      | Notes |
| ------ | ---------- | ----- |
| ${unit}   | ${swept.padEnd(10)} |       |
`;
  const getEvent = (type: LedgerEventType, date: string, eventUnit?: string): LedgerEvent => ({
    date,
    ledger,
    type,
    unit: eventUnit,
  });

  test("dates an open row from its sweep trailer", () => {
    expect.hasAssertions();

    expect(
      applyLedgerEvents(getText(OPEN_CELL), ledger, [getEvent(LedgerEventType.Ledger, earlier, unit)]),
    ).toStrictEqual({
      text: getText(earlier),
      unmatched: [],
    });
  });

  test("never lowers a date the file already holds", () => {
    expect.hasAssertions();

    expect(applyLedgerEvents(getText(later), ledger, [getEvent(LedgerEventType.Ledger, earlier, unit)])).toStrictEqual({
      text: getText(later),
      unmatched: [],
    });
  });

  test("reopens a row from a reopen naming the whole ledger", () => {
    expect.hasAssertions();

    expect(applyLedgerEvents(getText(earlier), ledger, [getEvent(LedgerEventType.Reopens, later)])).toStrictEqual({
      text: getText(OPEN_CELL),
      unmatched: [],
    });
  });

  // A promoted ledger is a folder of area files, and a rule change names the folder
  test("reopens a row from a reopen naming the folder above the ledger", () => {
    expect.hasAssertions();

    expect(
      applyLedgerEvents(getText(earlier), ledger, [{ ...getEvent(LedgerEventType.Reopens, later), ledger: "a" }]),
    ).toStrictEqual({
      text: getText(OPEN_CELL),
      unmatched: [],
    });
  });

  // The reset predates the pass it would undo, so the pass stands
  test("ignores a reopen older than the row's date", () => {
    expect.hasAssertions();

    expect(applyLedgerEvents(getText(later), ledger, [getEvent(LedgerEventType.Reopens, earlier)])).toStrictEqual({
      text: getText(later),
      unmatched: [],
    });
  });

  test("dates a row swept again after a reopen on the same day", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Reopens, later), getEvent(LedgerEventType.Ledger, later, unit)];

    expect(applyLedgerEvents(getText(earlier), ledger, events)).toStrictEqual({ text: getText(later), unmatched: [] });
  });

  test("reports a sweep trailer naming no row", () => {
    expect.hasAssertions();

    const event = getEvent(LedgerEventType.Ledger, earlier, "`d`");

    expect(applyLedgerEvents(getText(OPEN_CELL), ledger, [event])).toStrictEqual({
      text: getText(OPEN_CELL),
      unmatched: [event],
    });
  });

  test("leaves another ledger's events alone", () => {
    expect.hasAssertions();

    expect(
      applyLedgerEvents(getText(OPEN_CELL), ledger, [
        { ...getEvent(LedgerEventType.Ledger, earlier, unit), ledger: "x" },
      ]),
    ).toStrictEqual({
      text: getText(OPEN_CELL),
      unmatched: [],
    });
  });
});

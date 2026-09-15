import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import { describe, expect, test } from "vitest";

describe(applyLedgerEvents, () => {
  const ledger = "a/b";
  const unit = "`c`";
  const earlier = new Date(0).toISOString().slice(0, "1970-01-01".length);
  const later = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"))
    .toISOString()
    .slice(0, earlier.length);
  const getText = (swept: string) =>
    `| Unit | Swept      | Notes |\n| ---- | ---------- | ----- |\n| ${unit} | ${swept.padEnd(10)} |       |\n`;
  const getEvent = (type: LedgerEventType, date: string, eventUnit?: string): LedgerEvent => ({
    date,
    ledger,
    type,
    unit: eventUnit,
  });

  test("dates an open row from its sweep trailer", () => {
    expect.hasAssertions();

    expect(applyLedgerEvents(getText("—"), ledger, [getEvent(LedgerEventType.Ledger, earlier, unit)])).toStrictEqual({
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
      text: getText("—"),
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

    expect(applyLedgerEvents(getText("—"), ledger, [event])).toStrictEqual({ text: getText("—"), unmatched: [event] });
  });

  test("leaves another ledger's events alone", () => {
    expect.hasAssertions();

    expect(
      applyLedgerEvents(getText("—"), ledger, [{ ...getEvent(LedgerEventType.Ledger, earlier, unit), ledger: "x" }]),
    ).toStrictEqual({
      text: getText("—"),
      unmatched: [],
    });
  });
});

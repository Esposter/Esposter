import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import {
  OPEN_CELL,
  SWEPT_CELL_SEPARATOR,
  TRAILER_VALUE_SEPARATOR,
} from "#src/services/sweeps/ledgerCoverage/constants";
import { EPOCH_DATE } from "#src/services/sweeps/ledgerCoverage/constants.test";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { describe, expect, test } from "vitest";

describe(applyLedgerEvents, () => {
  const ledger = "a/b";
  const unit = "`c`";
  // A trailer's unit as getLedgerEvents hands it over, with the backticks already removed
  const bareUnit = "c";
  const earlier = EPOCH_DATE;
  const later = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")).toISOString().slice(0, 10);
  const getText = (swept: string, rowUnit = unit) =>
    `| Unit   | Swept      | Notes |
| ------ | ---------- | ----- |
| ${rowUnit}   | ${swept.padEnd(10)} |       |
`;
  const getEvent = (type: LedgerEventType, date: string, eventUnit?: string, model = ""): LedgerEvent => ({
    date,
    ledger,
    model,
    type,
    unit: eventUnit,
  });
  const getTrailerEvents = (trailerUnit: string) =>
    getLedgerEvents(
      `${earlier}${FIELD_SEPARATOR}${LedgerEventType.Ledger}: ${ledger}${TRAILER_VALUE_SEPARATOR}${trailerUnit}${RECORD_SEPARATOR}`,
    );

  test("dates an open row from its sweep trailer", () => {
    expect.hasAssertions();

    const event = getEvent(LedgerEventType.Ledger, earlier, bareUnit);

    expect(applyLedgerEvents(getText(OPEN_CELL), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(earlier),
    });
  });

  test("names the model the sweep commit was co-authored by", () => {
    expect.hasAssertions();

    const model = "d";
    const event = getEvent(LedgerEventType.Ledger, earlier, bareUnit, model);

    expect(applyLedgerEvents(getText(OPEN_CELL), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(`${earlier}${SWEPT_CELL_SEPARATOR}${model}`),
    });
  });

  test("dates a backticked row from a bare trailer unit", () => {
    expect.hasAssertions();

    const events = getTrailerEvents("c");

    expect(applyLedgerEvents(getText(OPEN_CELL), ledger, events)).toStrictEqual({
      matched: events,
      text: getText(earlier),
    });
  });

  test("dates a bare row from a backticked trailer unit", () => {
    expect.hasAssertions();

    const events = getTrailerEvents(unit);

    expect(applyLedgerEvents(getText(OPEN_CELL, bareUnit), ledger, events)).toStrictEqual({
      matched: events,
      text: getText(earlier, bareUnit),
    });
  });

  // A later pass on the same day is the one whose model read the unit last
  test("names the model of a same-day sweep over a dated row", () => {
    expect.hasAssertions();

    const model = "d";
    const event = getEvent(LedgerEventType.Ledger, earlier, bareUnit, model);

    expect(applyLedgerEvents(getText(earlier), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(`${earlier}${SWEPT_CELL_SEPARATOR}${model}`),
    });
  });

  test("never lowers a date the file already holds", () => {
    expect.hasAssertions();

    const event = getEvent(LedgerEventType.Ledger, earlier, bareUnit);

    expect(applyLedgerEvents(getText(later), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(later),
    });
  });

  test("reopens a row from a reopen naming the whole ledger", () => {
    expect.hasAssertions();

    const event = getEvent(LedgerEventType.Reopens, later);

    expect(applyLedgerEvents(getText(earlier), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(OPEN_CELL),
    });
  });

  // A promoted ledger is a folder of area files, and a rule change names the folder
  test("reopens a row from a reopen naming the folder above the ledger", () => {
    expect.hasAssertions();

    const event = { ...getEvent(LedgerEventType.Reopens, later), ledger: "a" };

    expect(applyLedgerEvents(getText(earlier), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(OPEN_CELL),
    });
  });

  // The reset predates the pass it would undo, so the pass stands
  test("ignores a reopen older than the row's date", () => {
    expect.hasAssertions();

    const event = getEvent(LedgerEventType.Reopens, earlier);

    expect(applyLedgerEvents(getText(later), ledger, [event])).toStrictEqual({
      matched: [event],
      text: getText(later),
    });
  });

  test("dates a row swept again after a reopen on the same day", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Reopens, later), getEvent(LedgerEventType.Ledger, later, bareUnit)];

    expect(applyLedgerEvents(getText(earlier), ledger, events)).toStrictEqual({
      matched: events,
      text: getText(later),
    });
  });

  // Matched is the caller's to aggregate across a folder, so a trailer naming no row here is simply absent from it
  test("leaves a sweep trailer naming no row out of the matched events", () => {
    expect.hasAssertions();

    const event = getEvent(LedgerEventType.Ledger, earlier, "d");

    expect(applyLedgerEvents(getText(OPEN_CELL), ledger, [event])).toStrictEqual({
      matched: [],
      text: getText(OPEN_CELL),
    });
  });

  test("leaves another ledger's events alone", () => {
    expect.hasAssertions();

    const event = { ...getEvent(LedgerEventType.Ledger, earlier, bareUnit), ledger: "x" };

    expect(applyLedgerEvents(getText(OPEN_CELL), ledger, [event])).toStrictEqual({
      matched: [],
      text: getText(OPEN_CELL),
    });
  });
});

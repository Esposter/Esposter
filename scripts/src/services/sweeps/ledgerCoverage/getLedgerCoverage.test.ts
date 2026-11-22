import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { TRAILER_VALUE_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { DAY_AFTER_EPOCH_DATE, EPOCH_DATE } from "#src/services/sweeps/ledgerCoverage/constants.test";
import { getLedgerCoverage } from "#src/services/sweeps/ledgerCoverage/getLedgerCoverage";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { describe, expect, test } from "vitest";

describe(getLedgerCoverage, () => {
  const ledger = "a/b";
  const unit = "`c`";
  // A trailer's unit as getLedgerEvents hands it over, with the backticks already removed
  const bareUnit = "c";
  const earlier = EPOCH_DATE;
  const later = DAY_AFTER_EPOCH_DATE;
  const model = "d";
  const getEvent = (type: LedgerEventType, date: string, eventUnit?: string, eventModel = ""): LedgerEvent => ({
    date,
    ledger,
    model: eventModel,
    type,
    unit: eventUnit,
  });
  const getSample = (date: string, defects: number): LedgerEvent => ({
    ...getEvent(LedgerEventType.Sampled, date),
    defects,
  });

  test("leaves a unit no trailer names open", () => {
    expect.hasAssertions();

    expect(getLedgerCoverage(ledger, [unit], [])).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test("dates a unit from its sweep trailer with the model that read it", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Ledger, earlier, bareUnit, model)];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([
      { date: earlier, model, state: UnitState.Swept, unit },
    ]);
  });

  test.each([
    ["a backticked unit from a bare trailer unit", unit, "c"],
    ["a bare unit from a backticked trailer unit", bareUnit, unit],
  ])("dates %s", (_description, ledgerUnit, trailerUnit) => {
    expect.hasAssertions();

    const events = getLedgerEvents(
      `${earlier}${FIELD_SEPARATOR}${LedgerEventType.Ledger}: ${ledger}${TRAILER_VALUE_SEPARATOR}${trailerUnit}${RECORD_SEPARATOR}`,
      [],
    );

    expect(getLedgerCoverage(ledger, [ledgerUnit], events)).toStrictEqual([
      { date: earlier, model: "", state: UnitState.Swept, unit: ledgerUnit },
    ]);
  });

  // A carried trailer is written after later passes, so its place is its date, never its position in the log
  test("never lowers a date to a carried trailer listed after it", () => {
    expect.hasAssertions();

    const events = [
      getEvent(LedgerEventType.Ledger, later, bareUnit),
      getEvent(LedgerEventType.Ledger, earlier, bareUnit),
    ];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([
      { date: later, model: "", state: UnitState.Swept, unit },
    ]);
  });

  test("keeps a carried date a later reopen listed before it clears", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Reopens, later), getEvent(LedgerEventType.Ledger, earlier, bareUnit)];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test("reopens a unit from a reopen naming the whole ledger", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Ledger, earlier, bareUnit), getEvent(LedgerEventType.Reopens, later)];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test("reopens only the unit a reopen names", () => {
    expect.hasAssertions();

    const otherUnit = "`e`";
    const events = [
      getEvent(LedgerEventType.Ledger, earlier, bareUnit),
      getEvent(LedgerEventType.Ledger, earlier, "e"),
      getEvent(LedgerEventType.Reopens, later, "e"),
    ];

    expect(getLedgerCoverage(ledger, [unit, otherUnit], events)).toStrictEqual([
      { date: earlier, model: "", state: UnitState.Swept, unit },
      { state: UnitState.Open, unit: otherUnit },
    ]);
  });

  // A reopen naming only an area clears the units that area holds, and leaves another area's units dated
  test("reopens only the units of the area a whole-area reopen names", () => {
    expect.hasAssertions();

    const otherUnit = "`e`";
    const events = [
      getEvent(LedgerEventType.Ledger, earlier, bareUnit),
      getEvent(LedgerEventType.Ledger, earlier, "e"),
      { ...getEvent(LedgerEventType.Reopens, later), area: "app-shell" },
    ];

    expect(
      getLedgerCoverage(ledger, [unit, otherUnit], events, {
        readUnitArea: (candidate) => (candidate === unit ? "app-shell" : "tooling"),
      }),
    ).toStrictEqual([
      { state: UnitState.Open, unit },
      { date: earlier, model: "", state: UnitState.Swept, unit: otherUnit },
    ]);
  });

  test("dates a unit swept again after a reopen on the same day", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Reopens, later), getEvent(LedgerEventType.Ledger, later, bareUnit)];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([
      { date: later, model: "", state: UnitState.Swept, unit },
    ]);
  });

  test("leaves another ledger's events alone", () => {
    expect.hasAssertions();

    const events = [{ ...getEvent(LedgerEventType.Ledger, earlier, bareUnit), ledger: "x" }];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test("holds a unit open whatever its trailers say when its ledger's check forces it", () => {
    expect.hasAssertions();

    const events = [getEvent(LedgerEventType.Ledger, earlier, bareUnit)];

    expect(getLedgerCoverage(ledger, [unit], events, { checkIsForcedOpen: () => true })).toStrictEqual([
      { state: UnitState.Open, unit },
    ]);
  });

  test("marks an unread unit sampled after a sample that found no defect", () => {
    expect.hasAssertions();

    expect(getLedgerCoverage(ledger, [unit], [getSample(earlier, 0)])).toStrictEqual([
      { state: UnitState.Sampled, unit },
    ]);
  });

  test("leaves an unread unit open after a sample that found a defect", () => {
    expect.hasAssertions();

    expect(getLedgerCoverage(ledger, [unit], [getSample(earlier, 1)])).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test("owes a sampled unit again after a reopen", () => {
    expect.hasAssertions();

    const events = [getSample(earlier, 0), getEvent(LedgerEventType.Reopens, later)];

    expect(getLedgerCoverage(ledger, [unit], events)).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test.each([
    ["the path itself", "c"],
    ["a file under it", "c/f.ts"],
  ])("owes a sampled unit again after a commit touches %s", (_description, changedPath) => {
    expect.hasAssertions();

    expect(
      getLedgerCoverage(ledger, [unit], [getSample(earlier, 0)], { readChangedPaths: () => [changedPath] }),
    ).toStrictEqual([{ state: UnitState.Open, unit }]);
  });

  test("keeps a sampled unit sampled when a commit touches a path that only shares its prefix", () => {
    expect.hasAssertions();

    expect(
      getLedgerCoverage(ledger, [unit], [getSample(earlier, 0)], { readChangedPaths: () => ["c-d/f.ts"] }),
    ).toStrictEqual([{ state: UnitState.Sampled, unit }]);
  });
});

import type { UnitCoverage } from "#src/models/sweeps/ledgerCoverage/UnitCoverage";

import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { getLedgerSample } from "#src/services/sweeps/ledgerCoverage/getLedgerSample";
import { describe, expect, test } from "vitest";

// Open cells `u<start>` up to but not including `u<end>`, so questions overlap on the cells they share
const getOpenUnits = (start: number, end: number): UnitCoverage[] =>
  Array.from({ length: end - start }, (_cell, index) => ({ state: UnitState.Open, unit: `\`u${start + index}\`` }));

describe(getLedgerSample, () => {
  test("draws thirty cells for each question holding thirty, rarest question first", () => {
    expect.hasAssertions();

    const statuses = [
      { ledger: "common", units: getOpenUnits(0, 40) },
      { ledger: "exact", units: getOpenUnits(5, 35) },
      { ledger: "rare", units: getOpenUnits(0, 5) },
    ];
    const samples = getLedgerSample(statuses, "seed", 30);

    expect(
      Object.fromEntries(
        statuses.map(({ ledger }) => [ledger, samples.filter(({ ledgers }) => ledgers.includes(ledger)).length]),
      ),
    ).toStrictEqual({ common: 30, exact: 30, rare: 5 });
    expect(samples.slice(0, 1).flatMap(({ ledgers }) => ledgers)).toStrictEqual(["rare", "common"]);
  });
});

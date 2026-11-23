import type { LedgerCoverage } from "#src/models/sweeps/ledgerCoverage/LedgerCoverage";

import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { EPOCH_DATE } from "#src/services/sweeps/ledgerCoverage/constants.test";
import { getTouchedLedgerSample } from "#src/services/sweeps/ledgerCoverage/getTouchedLedgerSample";
import { describe, expect, test } from "vitest";

describe(getTouchedLedgerSample, () => {
  test("draws each open cell holding a changed path in every question it is open in, and no other", () => {
    expect.hasAssertions();

    const statuses: LedgerCoverage[] = [
      {
        ledger: "alpha",
        units: [
          { state: UnitState.Open, unit: "`a`" },
          { state: UnitState.Open, unit: "`b`" },
          { date: EPOCH_DATE, state: UnitState.Swept, unit: "`c`" },
        ],
      },
      { ledger: "beta", units: [{ state: UnitState.Open, unit: "`a`" }] },
    ];
    const samples = getTouchedLedgerSample(statuses, ["`a`", "`b`", "`c`"], ["a/x.ts", "c/y.ts"]);

    expect(samples).toStrictEqual([{ ledgers: ["alpha", "beta"], unit: "a" }]);
  });
});

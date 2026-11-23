import type { LedgerFixerResult } from "#src/models/sweeps/ledgerCoverage/LedgerFixerResult";

import { LedgerFindingKind } from "#src/models/sweeps/ledgerCoverage/LedgerFindingKind";
import { LedgerFixerOutcome } from "#src/models/sweeps/ledgerCoverage/LedgerFixerOutcome";
import { getSampledCounts } from "#src/services/sweeps/ledgerCoverage/getSampledCounts";
import { describe, expect, test } from "vitest";

const createResult = (kind: LedgerFindingKind, outcome: LedgerFixerOutcome): LedgerFixerResult => ({
  commit: "",
  file: "a/x.ts",
  kind,
  ledger: "naming",
  line: 1,
  outcome,
  reason: "A reason.",
  unit: "a/x.ts",
});

describe(getSampledCounts, () => {
  const samples = [{ ledgers: ["naming"], unit: "a/x.ts" }];

  test.each([
    ["a fixed defect", LedgerFindingKind.Defect, LedgerFixerOutcome.Fixed, 1],
    ["a defect settled in its rule", LedgerFindingKind.Defect, LedgerFixerOutcome.Skill, 1],
    ["a defect left open", LedgerFindingKind.Defect, LedgerFixerOutcome.Open, 1],
    ["a refuted defect", LedgerFindingKind.Defect, LedgerFixerOutcome.Refuted, 0],
    ["a fixed tidy", LedgerFindingKind.Tidy, LedgerFixerOutcome.Fixed, 0],
    ["a tidy settled in its rule", LedgerFindingKind.Tidy, LedgerFixerOutcome.Skill, 0],
  ])("counts %s as %i defects", (_description, kind, outcome, defects) => {
    expect.hasAssertions();

    expect(getSampledCounts(samples, [createResult(kind, outcome)])).toStrictEqual([
      { defects, ledger: "naming", size: 1 },
    ]);
  });
});

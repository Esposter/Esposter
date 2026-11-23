import { ledgerJudgementSchema } from "#src/models/sweeps/ledgerCoverage/LedgerJudgement";
import { checkIsLedgerCellClean } from "#src/services/sweeps/ledgerCoverage/checkIsLedgerCellClean";
import { describe, expect, test } from "vitest";

describe(checkIsLedgerCellClean, () => {
  test("a reader's clean verdict does not clear a cell whose judgement holds a finding", () => {
    expect.hasAssertions();

    const judgement = ledgerJudgementSchema.parse({
      files: 1,
      findings: [{ file: "a/x.ts", fix: "rename the export", kind: "defect", line: 3, what: "a misnamed export" }],
      ledger: "naming",
      unit: "a/x.ts",
    });

    expect(checkIsLedgerCellClean({ judgements: [judgement], ledger: "naming", unit: "a/x.ts" })).toBe(false);
  });
});

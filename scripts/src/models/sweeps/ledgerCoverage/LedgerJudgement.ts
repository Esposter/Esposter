import type { LedgerJudgementFinding } from "#src/models/sweeps/ledgerCoverage/LedgerJudgementFinding";

import { ledgerJudgementFindingSchema } from "#src/models/sweeps/ledgerCoverage/LedgerJudgementFinding";
import { LedgerVerdict } from "#src/models/sweeps/ledgerCoverage/LedgerVerdict";
import { z } from "zod";

// One reader's judgement of one question's unit, one line of the reader's output file
export interface LedgerJudgement {
  files: number;
  findings: LedgerJudgementFinding[];
  ledger: string;
  unit: string;
  verdict: LedgerVerdict;
}

export const ledgerJudgementSchema: z.ZodType<LedgerJudgement> = z.object({
  files: z.int().nonnegative(),
  findings: z.array(ledgerJudgementFindingSchema),
  ledger: z.string().min(1),
  unit: z.string().min(1),
  verdict: z.enum(LedgerVerdict),
});

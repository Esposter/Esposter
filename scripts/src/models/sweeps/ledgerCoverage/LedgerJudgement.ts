import type { LedgerJudgementFinding } from "#src/models/sweeps/ledgerCoverage/LedgerJudgementFinding";

import { ledgerJudgementFindingSchema } from "#src/models/sweeps/ledgerCoverage/LedgerJudgementFinding";
import { z } from "zod";

// One reader's judgement of one question's unit, one line of the reader's output file. A unit with no finding is clean
export interface LedgerJudgement {
  files: number;
  findings: LedgerJudgementFinding[];
  ledger: string;
  unit: string;
}

export const ledgerJudgementSchema: z.ZodType<LedgerJudgement> = z.object({
  files: z.int().nonnegative(),
  findings: z.array(ledgerJudgementFindingSchema),
  ledger: z.string().min(1),
  unit: z.string().min(1),
});

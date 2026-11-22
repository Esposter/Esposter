import { LedgerJudgementFindingKind } from "#src/models/sweeps/ledgerCoverage/LedgerJudgementFindingKind";
import { z } from "zod";

// One finding a reader wrote: the line it cites, what is wrong there and how it would be fixed
export interface LedgerJudgementFinding {
  file: string;
  fix: string;
  kind: LedgerJudgementFindingKind;
  line: number;
  what: string;
}

export const ledgerJudgementFindingSchema: z.ZodType<LedgerJudgementFinding> = z.object({
  file: z.string().min(1),
  fix: z.string().min(1),
  kind: z.enum(LedgerJudgementFindingKind),
  line: z.int().nonnegative(),
  what: z.string().min(1),
});

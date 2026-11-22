import { LedgerFindingKind } from "#src/models/sweeps/ledgerCoverage/LedgerFindingKind";
import { LedgerFixerOutcome } from "#src/models/sweeps/ledgerCoverage/LedgerFixerOutcome";
import { z } from "zod";

// One finding a fixer answered, one line of its result file: the unit and question it came from, the finding's place,
// What the fixer did with it and the commit that holds the fix
export interface LedgerFixerResult {
  commit: string;
  file: string;
  kind: LedgerFindingKind;
  ledger: string;
  line: number;
  outcome: LedgerFixerOutcome;
  reason: string;
  unit: string;
}

export const ledgerFixerResultSchema: z.ZodType<LedgerFixerResult> = z.object({
  commit: z.string(),
  file: z.string().min(1),
  kind: z.enum(LedgerFindingKind),
  ledger: z.string().min(1),
  line: z.int().nonnegative(),
  outcome: z.enum(LedgerFixerOutcome),
  reason: z.string().min(1),
  unit: z.string().min(1),
});

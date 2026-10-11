import type { LedgerVerdict } from "#src/models/dependencies/score/LedgerVerdict";

export interface ParsedVerdict {
  kind?: LedgerVerdict;
  reason: string;
}

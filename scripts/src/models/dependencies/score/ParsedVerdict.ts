import type { LedgerVerdict } from "#src/models/dependencies/score/LedgerVerdict";

export interface ParsedVerdict {
  kind?: LedgerVerdict | undefined;
  reason: string;
}

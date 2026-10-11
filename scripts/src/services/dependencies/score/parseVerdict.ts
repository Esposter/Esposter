import type { ParsedVerdict } from "#src/models/dependencies/score/ParsedVerdict";

import { LedgerVerdict } from "#src/models/dependencies/score/LedgerVerdict";
import { VERDICT_SEPARATOR } from "#src/services/dependencies/score/constants";

// A verdict cell is `<kind> — <reason>`, and an unjudged one has no kind to read
export const parseVerdict = (verdict: string): ParsedVerdict => {
  const [kindText = "", reason = ""] = verdict.split(VERDICT_SEPARATOR);
  const kind = Object.values(LedgerVerdict).find((ledgerVerdict) => ledgerVerdict === kindText);
  return { kind, reason };
};

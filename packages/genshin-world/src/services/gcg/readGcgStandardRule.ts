import type { GcgRule } from "#src/models/gcg/GcgRule";

import { gcgStandardRuleSchema } from "#src/models/gcg/gcgStandardRuleSchema";
import { readGameData } from "#src/services/data/readGameData";

// The standard duel rule, fetched by its key from the hosted game data when a duel is first set up, so no page reads a
// Duel's table it does not play
export const readGcgStandardRule = (gameDataBaseUrl: string): Promise<GcgRule> =>
  readGameData(gameDataBaseUrl, "gcg/standardRule", gcgStandardRuleSchema);

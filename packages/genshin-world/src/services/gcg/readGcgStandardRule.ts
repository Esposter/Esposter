import type { GcgRule } from "#src/models/gcg/GcgRule";

import { gcgStandardRuleSchema } from "#src/models/gcg/gcgStandardRuleSchema";

// The standard duel rule, its slice imported on demand when a duel is first set up, so no duel's table sits in the main
// Bundle of every page
export const readGcgStandardRule = async (): Promise<GcgRule> => {
  const { default: standardRule } = await import("#src/generated/gcg/standardRule.json");
  return gcgStandardRuleSchema.parse(standardRule);
};

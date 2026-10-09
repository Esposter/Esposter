import type { ExcelGcgElementReactionRow } from "#src/models/genshinAssets/gcg/ExcelGcgElementReactionRow";
import type { ExcelGcgRuleRow } from "#src/models/genshinAssets/gcg/ExcelGcgRuleRow";
import type { GcgStandardRule } from "#src/models/genshinAssets/gcg/GcgStandardRule";

import { GCG_STANDARD_RULE_ID } from "#src/services/genshinAssets/gcg/constants";
import { toGcgStandardRule } from "#src/services/genshinAssets/gcg/toGcgStandardRule";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset, gcgStandardRuleSchema } from "genshin-world";

// The standard duel rule, read from the dump's rule and reaction tables, checked against its schema and published as one
// Small record, which the world imports on demand when a duel is first set up
export const buildGcgStandardRule = (): Record<string, GcgStandardRule> => {
  const ruleRow = readExcelTable<ExcelGcgRuleRow>("GCGRuleExcelConfigData").find(
    ({ id }) => id === GCG_STANDARD_RULE_ID,
  );
  if (!ruleRow)
    throw new InvalidOperationError(
      Operation.Read,
      "standard rule",
      `the rule table holds no rule ${GCG_STANDARD_RULE_ID}`,
    );
  const reactionRows = readExcelTable<ExcelGcgElementReactionRow>("GCGElementReactionExcelConfigData");
  return { [`${GameDataset.Gcg}/standardRule`]: gcgStandardRuleSchema.parse(toGcgStandardRule(ruleRow, reactionRows)) };
};

import type { ExcelGcgElementReactionRow } from "#src/models/genshinAssets/gcg/ExcelGcgElementReactionRow";
import type { ExcelGcgRuleRow } from "#src/models/genshinAssets/gcg/ExcelGcgRuleRow";

import {
  GCG_GENERATED_DIRECTORY,
  GCG_STANDARD_RULE_ID,
  GCG_STANDARD_RULE_PATH,
} from "#src/services/genshinAssets/gcg/constants";
import { toGcgStandardRule } from "#src/services/genshinAssets/gcg/toGcgStandardRule";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { gcgStandardRuleSchema } from "genshin-world";
import { mkdirSync, writeFileSync } from "node:fs";

// The standard duel rule, read from the dump's rule and reaction tables and written as one small slice in the world's
// Generated folder, which the world imports on demand when a duel is first set up
export const writeGcgStandardRule = (): void => {
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
  mkdirSync(GCG_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(
    GCG_STANDARD_RULE_PATH,
    `${JSON.stringify(gcgStandardRuleSchema.parse(toGcgStandardRule(ruleRow, reactionRows)), undefined, 2)}\n`,
  );
};

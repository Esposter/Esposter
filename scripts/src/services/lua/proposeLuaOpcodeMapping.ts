import type { LuaOpcodeProposal } from "#src/models/lua/LuaOpcodeProposal";
import type { LuaOpcodeRuleContext } from "#src/models/lua/LuaOpcodeRule";
import type { LuaOpcodeStatistic } from "#src/models/lua/LuaOpcodeStatistic";

import { LuaOpcode } from "#src/models/lua/LuaOpcode";
import { getLuaOpcodeRules } from "#src/services/lua/getLuaOpcodeRules";
import { takeOne } from "@esposter/shared";

// Proposes the stock opcode of each dialect number a chunk contains. A rule decides a number only when exactly one
// Undecided number meets it, else that rule decides nothing. A number no rule reaches stays unknown, with the reason
export const proposeLuaOpcodeMapping = (
  statistics: LuaOpcodeStatistic[],
  functionCount: number,
): LuaOpcodeProposal[] => {
  const decided = new Map<number, LuaOpcode>();
  const evidence = new Map<number, string>();
  for (const rule of getLuaOpcodeRules()) {
    const setDialectOpcodes = [...decided]
      .filter(([, stockOpcode]) => stockOpcode === LuaOpcode.SetTable || stockOpcode === LuaOpcode.SetList)
      .map(([dialectOpcode]) => dialectOpcode);
    const context: LuaOpcodeRuleContext = { functionCount, setDialectOpcodes };
    const matches = statistics.flatMap((statistic) => {
      if (decided.has(statistic.opcode)) return [];
      const description = rule.describe(statistic, context);
      return description === undefined ? [] : [{ description, opcode: statistic.opcode }];
    });
    if (matches.length !== 1) continue;
    const match = takeOne(matches, 0);
    decided.set(match.opcode, rule.stockOpcode);
    evidence.set(match.opcode, match.description);
  }
  return statistics.map((statistic) => ({
    evidence: evidence.get(statistic.opcode) ?? "no rule holds of it alone, or more than one does",
    statistic,
    stockOpcode: decided.get(statistic.opcode),
  }));
};

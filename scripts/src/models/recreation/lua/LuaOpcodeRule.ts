import type { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import type { LuaOpcodeStatistic } from "#src/models/recreation/lua/LuaOpcodeStatistic";

// A stock opcode's constraint over one dialect opcode's statistics: the evidence it holds with, or undefined
// Dialect numbers already decided by an earlier rule arrive as `setDialectOpcodes`, for a rule that names them
export interface LuaOpcodeRule {
  describe: (statistic: LuaOpcodeStatistic, context: LuaOpcodeRuleContext) => string | undefined;
  stockOpcode: LuaOpcode;
}

export interface LuaOpcodeRuleContext {
  functionCount: number;
  setDialectOpcodes: number[];
}

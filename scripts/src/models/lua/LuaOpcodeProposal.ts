import type { LuaOpcode } from "#src/models/lua/LuaOpcode";
import type { LuaOpcodeStatistic } from "#src/models/lua/LuaOpcodeStatistic";

// A dialect opcode number's statistics, with its proposed stock opcode and the constraint that decided it, or the
// Reason it stays unknown
export interface LuaOpcodeProposal {
  evidence: string;
  statistic: LuaOpcodeStatistic;
  stockOpcode?: LuaOpcode;
}

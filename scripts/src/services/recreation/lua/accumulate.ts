import type { LuaFunction } from "#src/models/recreation/lua/LuaFunction";
import type { LuaOpcodeStatistic } from "#src/models/recreation/lua/LuaOpcodeStatistic";

import { LUA_CONSTANT_FLAG, LUA_NEXT_SAME_A_WINDOW } from "#src/services/recreation/lua/constants";
import { createStatistic } from "#src/services/recreation/lua/createStatistic";
import { decodeLuaInstruction } from "#src/services/recreation/lua/decodeLuaInstruction";
import { takeOne } from "@esposter/shared";

// Adds one instruction's fields to its opcode's statistic, looking ahead for the next instruction that names its A
export const accumulate = (
  statistics: Map<number, LuaOpcodeStatistic>,
  luaFunction: LuaFunction,
  programCounter: number,
): void => {
  const instruction = decodeLuaInstruction(takeOne(luaFunction.instructions, programCounter));
  const statistic = statistics.get(instruction.opcode) ?? createStatistic(instruction.opcode);
  statistics.set(instruction.opcode, statistic);
  statistic.count++;
  statistic.aMin = Math.min(statistic.aMin, instruction.a);
  statistic.aMax = Math.max(statistic.aMax, instruction.a);
  statistic.bMin = Math.min(statistic.bMin, instruction.b);
  statistic.bMax = Math.max(statistic.bMax, instruction.b);
  statistic.cMin = Math.min(statistic.cMin, instruction.c);
  statistic.cMax = Math.max(statistic.cMax, instruction.c);
  statistic.bxMin = Math.min(statistic.bxMin, instruction.bx);
  statistic.bxMax = Math.max(statistic.bxMax, instruction.bx);
  if (instruction.b & LUA_CONSTANT_FLAG) statistic.rkBCount++;
  if (instruction.c & LUA_CONSTANT_FLAG) statistic.rkCCount++;
  if (instruction.bx < luaFunction.constants.length) statistic.bxBelowConstantsCount++;
  if (programCounter === luaFunction.instructions.length - 1) statistic.lastInFunctionCount++;
  const windowEnd = Math.min(luaFunction.instructions.length, programCounter + LUA_NEXT_SAME_A_WINDOW + 1);
  for (let next = programCounter + 1; next < windowEnd; next++) {
    const nextInstruction = decodeLuaInstruction(takeOne(luaFunction.instructions, next));
    if (nextInstruction.a !== instruction.a) continue;
    statistic.nextSameAOpcodes[nextInstruction.opcode] = (statistic.nextSameAOpcodes[nextInstruction.opcode] ?? 0) + 1;
    break;
  }
};

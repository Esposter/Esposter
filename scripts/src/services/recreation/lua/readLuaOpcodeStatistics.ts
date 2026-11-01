import type { LuaFunction } from "#src/models/recreation/lua/LuaFunction";
import type { LuaOpcodeStatistic } from "#src/models/recreation/lua/LuaOpcodeStatistic";

import { accumulate } from "#src/services/recreation/lua/accumulate";
import { flattenLuaFunctions } from "#src/services/recreation/lua/flattenLuaFunctions";

// Each dialect opcode number's operand statistics over every function of a chunk, sorted by opcode
export const readLuaOpcodeStatistics = (luaFunction: LuaFunction): LuaOpcodeStatistic[] => {
  const statistics = new Map<number, LuaOpcodeStatistic>();
  for (const flattened of flattenLuaFunctions(luaFunction))
    for (let programCounter = 0; programCounter < flattened.instructions.length; programCounter++)
      accumulate(statistics, flattened, programCounter);
  return [...statistics.values()].toSorted(
    (firstStatistic, secondStatistic) => firstStatistic.opcode - secondStatistic.opcode,
  );
};

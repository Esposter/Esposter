import type { LuaDataMachine } from "#src/models/recreation/lua/LuaDataMachine";
import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";
import type { LuaFunction } from "#src/models/recreation/lua/LuaFunction";
import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LuaTable } from "#src/models/recreation/lua/LuaTable";
import { executeLuaDataInstruction } from "#src/services/recreation/lua/executeLuaDataInstruction";
import { readGlobalName } from "#src/services/recreation/lua/readGlobalName";
import { readLuaValue } from "#src/services/recreation/lua/readLuaValue";

// Runs a data-only chunk's main function in its dialect and returns the globals it set, each as a JS value
export const evaluateLuaDataChunk = (luaFunction: LuaFunction, dialect: LuaDialect): Record<string, unknown> => {
  const machine: LuaDataMachine = {
    dialect,
    environment: new LuaTable(),
    luaFunction,
    registers: Array.from({ length: luaFunction.maxStackSize }, (): LuaValue => undefined),
  };
  let programCounter: number | undefined = 0;
  while (programCounter !== undefined) programCounter = executeLuaDataInstruction(machine, programCounter);
  return Object.fromEntries(
    Array.from(machine.environment.entries, ([name, value]) => [readGlobalName(name), readLuaValue(value)]),
  );
};

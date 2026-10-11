import type { LuaDataMachine } from "#src/models/lua/LuaDataMachine";
import type { LuaFunction } from "#src/models/lua/LuaFunction";
import type { LuaValue } from "#src/models/lua/LuaValue";

import { LuaTable } from "#src/models/lua/LuaTable";
import { executeLuaDataInstruction } from "#src/services/lua/executeLuaDataInstruction";
import { readLuaValue } from "#src/services/lua/readLuaValue";

// Runs a data-only chunk's main function and returns the globals it set, each as a JS value
export const evaluateLuaDataChunk = (luaFunction: LuaFunction): Record<string, unknown> => {
  const machine: LuaDataMachine = {
    environment: new LuaTable(),
    luaFunction,
    registers: Array.from({ length: luaFunction.maxStackSize }, (): LuaValue => undefined),
  };
  let programCounter: number | undefined = 0;
  while (programCounter !== undefined) programCounter = executeLuaDataInstruction(machine, programCounter);
  return Object.fromEntries(
    Array.from(machine.environment.entries, ([name, value]) => [String(name), readLuaValue(value)]),
  );
};

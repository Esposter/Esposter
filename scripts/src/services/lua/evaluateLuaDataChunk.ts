import type { LuaDataMachine } from "#src/models/lua/LuaDataMachine";
import type { LuaDialect } from "#src/models/lua/LuaDialect";
import type { LuaFunction } from "#src/models/lua/LuaFunction";
import type { LuaValue } from "#src/models/lua/LuaValue";

import { LuaTable } from "#src/models/lua/LuaTable";
import { LUA_CHUNK_NAME } from "#src/services/lua/constants";
import { executeLuaDataInstruction } from "#src/services/lua/executeLuaDataInstruction";
import { readLuaValue } from "#src/services/lua/readLuaValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A global's name is a string or a number constant, the only keys a global assignment sets
const readGlobalName = (name: LuaValue): string => {
  if (typeof name === "string" || typeof name === "number") return String(name);
  throw new InvalidOperationError(
    Operation.Read,
    LUA_CHUNK_NAME,
    "sets a global with a key that is neither a string nor a number",
  );
};

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

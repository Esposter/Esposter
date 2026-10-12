import type { LuaDataMachine } from "#src/models/recreation/lua/LuaDataMachine";

import { LuaTable } from "#src/models/recreation/lua/LuaTable";
import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const readLuaTable = (machine: LuaDataMachine, register: number): LuaTable => {
  const value = machine.registers[register];
  if (!(value instanceof LuaTable))
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `register ${register} holds no table`);
  return value;
};

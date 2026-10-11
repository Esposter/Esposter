import type { LuaFunction } from "#src/models/lua/LuaFunction";
import type { LuaTable } from "#src/models/lua/LuaTable";
import type { LuaValue } from "#src/models/lua/LuaValue";

// The state a data chunk runs over: its registers, and the environment its global assignments set
export interface LuaDataMachine {
  environment: LuaTable;
  luaFunction: LuaFunction;
  registers: LuaValue[];
}

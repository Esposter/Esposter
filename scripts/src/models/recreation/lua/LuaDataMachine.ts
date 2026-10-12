import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";
import type { LuaFunction } from "#src/models/recreation/lua/LuaFunction";
import type { LuaTable } from "#src/models/recreation/lua/LuaTable";
import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

// The state a data chunk runs over: its dialect, its registers, and the environment its global assignments set
export interface LuaDataMachine {
  dialect: LuaDialect;
  environment: LuaTable;
  luaFunction: LuaFunction;
  registers: LuaValue[];
}

import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LuaTable } from "#src/models/recreation/lua/LuaTable";
import { readLuaTableValue } from "#src/services/recreation/lua/readLuaTableValue";

export const readLuaValue = (value: LuaValue): unknown =>
  value instanceof LuaTable ? readLuaTableValue(value, readLuaValue) : value;

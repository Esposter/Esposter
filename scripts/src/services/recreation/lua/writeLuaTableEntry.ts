import type { LuaTable } from "#src/models/recreation/lua/LuaTable";
import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const writeLuaTableEntry = (table: LuaTable, key: LuaValue, value: LuaValue): void => {
  if (key === undefined) throw new InvalidOperationError(Operation.Update, LUA_CHUNK_NAME, "sets a nil key");
  table.set(key, value);
};

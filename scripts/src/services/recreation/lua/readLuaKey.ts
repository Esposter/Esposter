import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LuaTable } from "#src/models/recreation/lua/LuaTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A key that is a table has no string an object could take it as, so the table is refused rather than keyed `[object Object]`
export const readLuaKey = (key: LuaValue): string => {
  if (key instanceof LuaTable)
    throw new InvalidOperationError(Operation.Read, "lua table", "has a table as a key, which no object can take");
  return String(key);
};

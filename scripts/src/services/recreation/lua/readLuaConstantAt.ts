import type { LuaConstant } from "#src/models/recreation/lua/LuaConstant";
import type { LuaFunction } from "#src/models/recreation/lua/LuaFunction";

import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const readLuaConstantAt = (luaFunction: LuaFunction, index: number): LuaConstant => {
  if (index >= luaFunction.constants.length)
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `constant ${index} is past its ${luaFunction.constants.length} constants`,
    );
  return luaFunction.constants[index];
};

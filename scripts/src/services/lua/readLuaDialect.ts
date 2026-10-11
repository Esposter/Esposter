import type { LuaDialect } from "#src/models/lua/LuaDialect";

import { LuaDialectName } from "#src/models/lua/LuaDialectName";
import { GENSHIN_LUA_53 } from "#src/services/lua/GENSHIN_LUA_53";
import { STOCK_LUA_53 } from "#src/services/lua/STOCK_LUA_53";

export const readLuaDialect = (name: LuaDialectName): LuaDialect =>
  name === LuaDialectName.Stock ? STOCK_LUA_53 : GENSHIN_LUA_53;

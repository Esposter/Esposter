// The type tag a constant carries in a binary chunk (`LUA_TNIL` through `LUA_TLNGSTR` in Lua 5.3's lobject.h)
export const LuaConstantTag = { Nil: 0, Boolean: 1, Float: 3, ShortString: 4, Integer: 19, LongString: 20 } as const;
export type LuaConstantTag = (typeof LuaConstantTag)[keyof typeof LuaConstantTag];

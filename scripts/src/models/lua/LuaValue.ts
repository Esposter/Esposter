import type { LuaTable } from "#src/models/lua/LuaTable";

// A value a data chunk's registers and tables hold; nil is undefined
export type LuaValue = boolean | LuaTable | number | string | undefined;

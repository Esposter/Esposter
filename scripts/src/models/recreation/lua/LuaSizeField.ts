// A C type whose size a binary chunk's header records, in the order a dialect writes them
export const LuaSizeField = {
  Instruction: "Instruction",
  Int: "int",
  LuaInteger: "lua_Integer",
  LuaNumber: "lua_Number",
  SizeT: "size_t",
} as const;
export type LuaSizeField = (typeof LuaSizeField)[keyof typeof LuaSizeField];

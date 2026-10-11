// A C type whose size a binary chunk's header records, in the order a dialect writes them
export enum LuaSizeField {
  Instruction = "Instruction",
  Int = "int",
  LuaInteger = "lua_Integer",
  LuaNumber = "lua_Number",
  SizeT = "size_t",
}

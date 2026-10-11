import type { LuaDialect } from "#src/models/recreation/lua/LuaDialect";

import { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import { LuaSizeField } from "#src/models/recreation/lua/LuaSizeField";

// The client's scene scripts: Lua 5.3's bytecode with format byte 1 and no size_t in its header, and six opcode numbers
// The scene data uses, each mapped by the constraints `recreation lua-dialect` reports. Every other number is unknown
export const GENSHIN_LUA_53: LuaDialect = {
  format: 1,
  name: "genshin Lua 5.3",
  opcodes: {
    22: LuaOpcode.LoadConstant,
    25: LuaOpcode.Return,
    27: LuaOpcode.SetList,
    31: LuaOpcode.SetTable,
    34: LuaOpcode.SetTableUpvalue,
    43: LuaOpcode.NewTable,
  },
  sizes: [LuaSizeField.Int, LuaSizeField.Instruction, LuaSizeField.LuaInteger, LuaSizeField.LuaNumber],
};

import type { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import type { LuaSizeField } from "#src/models/recreation/lua/LuaSizeField";

// How a binary chunk differs from Lua 5.3's: its format byte, the size fields its header records in order, and the
// Stock opcode each of its opcode numbers stands for. A number the dialect does not map is unknown, never guessed
export interface LuaDialect {
  format: number;
  name: string;
  opcodes: Record<number, LuaOpcode>;
  sizes: LuaSizeField[];
}

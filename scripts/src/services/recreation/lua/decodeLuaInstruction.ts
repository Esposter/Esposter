import type { LuaInstruction } from "#src/models/recreation/lua/LuaInstruction";

import {
  LUA_A_MASK,
  LUA_A_SHIFT,
  LUA_ARGUMENT_MASK,
  LUA_AX_SHIFT,
  LUA_B_SHIFT,
  LUA_BX_SHIFT,
  LUA_C_SHIFT,
  LUA_MAXARG_SBX,
  LUA_OPCODE_MASK,
} from "#src/services/recreation/lua/constants";

// Every field of a 32-bit instruction, read whether or not its opcode uses it, so a decode never depends on the opcode
export const decodeLuaInstruction = (instruction: number): LuaInstruction => {
  const bx = instruction >>> LUA_BX_SHIFT;
  return {
    a: (instruction >>> LUA_A_SHIFT) & LUA_A_MASK,
    ax: instruction >>> LUA_AX_SHIFT,
    b: (instruction >>> LUA_B_SHIFT) & LUA_ARGUMENT_MASK,
    bx,
    c: (instruction >>> LUA_C_SHIFT) & LUA_ARGUMENT_MASK,
    opcode: instruction & LUA_OPCODE_MASK,
    sbx: bx - LUA_MAXARG_SBX,
  };
};

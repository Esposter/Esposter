import { LuaOpcodeNames } from "#src/models/recreation/lua/LuaOpcode";

// An opcode's name, or its number where the instruction set has none
export const readLuaOpcodeName = (opcode: number): string => LuaOpcodeNames.get(opcode) ?? String(opcode);

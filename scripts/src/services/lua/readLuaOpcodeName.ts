import { LuaOpcode } from "#src/models/lua/LuaOpcode";

// An opcode's name, or its number where the instruction set has none
export const readLuaOpcodeName = (opcode: number): string => {
  const name: string | undefined = LuaOpcode[opcode];
  return name ?? String(opcode);
};

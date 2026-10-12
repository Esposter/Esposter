// One 32-bit instruction's fields, each read whether or not its opcode uses it
export interface LuaInstruction {
  a: number;
  ax: number;
  b: number;
  bx: number;
  c: number;
  opcode: number;
  sbx: number;
}

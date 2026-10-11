// Lua 5.3's binary chunk header (`lundump.c`, `lundump.h`): the signature, the version, the format, the data check
// bytes and the sizes of an instruction, a lua_Integer and a lua_Number, then the integer and float the header proves
export const LUA_SIGNATURE_BYTES = Uint8Array.of(0x1b, 0x4c, 0x75, 0x61);
export const LUA_VERSION = 0x53;
export const LUA_FORMAT = 0;
export const LUAC_DATA_BYTES = Uint8Array.of(0x19, 0x93, 0x0d, 0x0a, 0x1a, 0x0a);
export const LUA_INSTRUCTION_BYTES = 4;
export const LUA_INTEGER_BYTES = 8;
export const LUA_NUMBER_BYTES = 8;
export const LUAC_INTEGER = 0x5678n;
export const LUAC_NUMBER = 370.5;
// A string's size is one byte, or this escape and a size_t, which a 64-bit build writes as eight bytes
export const LUA_LONG_STRING_SIZE_ESCAPE = 0xff;
export const LUA_CHUNK_NAME = "lua chunk";

// An instruction's fields as Lua 5.3 packs them: the opcode in six bits, A in eight, B and C in nine each, Bx
// in eighteen. A B or C operand with its top bit set names a constant, and sBx is biased by MAXARG_sBx
export const LUA_OPCODE_MASK = 0x3f;
export const LUA_A_SHIFT = 6;
export const LUA_A_MASK = 0xff;
export const LUA_C_SHIFT = 14;
export const LUA_B_SHIFT = 23;
export const LUA_ARGUMENT_MASK = 0x1ff;
export const LUA_BX_SHIFT = 14;
export const LUA_AX_SHIFT = 6;
export const LUA_MAXARG_SBX = 131071;
export const LUA_CONSTANT_FLAG = 0x100;
export const LUA_FIELDS_PER_FLUSH = 50;

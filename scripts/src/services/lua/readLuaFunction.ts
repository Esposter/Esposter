import type { LuaByteReader } from "#src/models/lua/LuaByteReader";
import type { LuaFunction } from "#src/models/lua/LuaFunction";

import { readLuaConstant } from "#src/services/lua/readLuaConstant";
import { readLuaString } from "#src/services/lua/readLuaString";

// A prototype in Lua 5.3's order: its source, lines, parameters, code, constants, upvalues, nested prototypes,
// then its debug information. A source left out inherits its parent's, as a nested function's does
export const readLuaFunction = (reader: LuaByteReader, parentSource: string): LuaFunction => {
  const source = readLuaString(reader) || parentSource;
  const lineDefined = reader.readUint32();
  const lastLineDefined = reader.readUint32();
  const numParameters = reader.readByte();
  const isVararg = reader.readByte() !== 0;
  const maxStackSize = reader.readByte();
  const instructions = Array.from({ length: reader.readUint32() }, () => reader.readUint32());
  const constants = Array.from({ length: reader.readUint32() }, () => readLuaConstant(reader));
  // Each field is read into its own binding, since an object literal would read them in its own order
  const upvalues = Array.from({ length: reader.readUint32() }, () => {
    const inStack = reader.readByte() !== 0;
    const index = reader.readByte();
    return { index, inStack };
  });
  const prototypes = Array.from({ length: reader.readUint32() }, () => readLuaFunction(reader, source));
  const lineInformation = Array.from({ length: reader.readUint32() }, () => reader.readUint32());
  const localVariables = Array.from({ length: reader.readUint32() }, () => {
    const name = readLuaString(reader);
    const startPc = reader.readUint32();
    const endPc = reader.readUint32();
    return { endPc, name, startPc };
  });
  const upvalueNames = Array.from({ length: reader.readUint32() }, () => readLuaString(reader));
  return {
    constants,
    instructions,
    isVararg,
    lastLineDefined,
    lineDefined,
    lineInformation,
    localVariables,
    maxStackSize,
    numParameters,
    prototypes,
    source,
    upvalueNames,
    upvalues,
  };
};

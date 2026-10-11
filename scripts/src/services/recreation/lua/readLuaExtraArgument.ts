import type { LuaDataMachine } from "#src/models/recreation/lua/LuaDataMachine";
import type { LuaInstruction } from "#src/models/recreation/lua/LuaInstruction";

import { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { decodeLuaInstruction } from "#src/services/recreation/lua/decodeLuaInstruction";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The instruction after one that carries an extra argument, which must be an EXTRAARG in the machine's dialect
export const readLuaExtraArgument = (machine: LuaDataMachine, programCounter: number): LuaInstruction => {
  const word = machine.luaFunction.instructions[programCounter + 1];
  if (word === undefined)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `pc ${programCounter} has no extra argument`);
  const instruction = decodeLuaInstruction(word);
  if (machine.dialect.opcodes[instruction.opcode] !== LuaOpcode.ExtraArgument)
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `pc ${programCounter} needs an extra argument, but pc ${programCounter + 1} is not one`,
    );
  return instruction;
};

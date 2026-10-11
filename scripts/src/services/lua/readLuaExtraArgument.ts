import type { LuaFunction } from "#src/models/lua/LuaFunction";
import type { LuaInstruction } from "#src/models/lua/LuaInstruction";

import { LuaOpcode } from "#src/models/lua/LuaOpcode";
import { LUA_CHUNK_NAME } from "#src/services/lua/constants";
import { decodeLuaInstruction } from "#src/services/lua/decodeLuaInstruction";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The instruction after one that carries an extra argument, which must be an EXTRAARG
export const readLuaExtraArgument = (luaFunction: LuaFunction, programCounter: number): LuaInstruction => {
  const word = luaFunction.instructions[programCounter + 1];
  if (word === undefined)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `pc ${programCounter} has no extra argument`);
  const instruction = decodeLuaInstruction(word);
  if (instruction.opcode !== LuaOpcode.ExtraArgument)
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `pc ${programCounter} needs an extra argument, but pc ${programCounter + 1} is not one`,
    );
  return instruction;
};

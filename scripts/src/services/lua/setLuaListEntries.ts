import type { LuaDataMachine } from "#src/models/lua/LuaDataMachine";

import { LUA_CHUNK_NAME, LUA_FIELDS_PER_FLUSH } from "#src/services/lua/constants";
import { decodeLuaInstruction } from "#src/services/lua/decodeLuaInstruction";
import { readLuaExtraArgument } from "#src/services/lua/readLuaExtraArgument";
import { readLuaTable } from "#src/services/lua/readLuaTable";
import { writeLuaTableEntry } from "#src/services/lua/writeLuaTableEntry";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Stores the registers after A into the table at A, from the block C names, and returns the next pc
export const setLuaListEntries = (machine: LuaDataMachine, programCounter: number): number => {
  const word = machine.luaFunction.instructions[programCounter];
  if (word === undefined)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `pc ${programCounter} is past the code`);
  const { a, b, c } = decodeLuaInstruction(word);
  if (b === 0)
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `pc ${programCounter} takes its count from the stack top, which only calls set`,
    );
  // A block of zero names its block in the extra argument that follows
  const hasExtraArgument = c === 0;
  const block = hasExtraArgument ? readLuaExtraArgument(machine, programCounter).ax : c;
  const offset = (block - 1) * LUA_FIELDS_PER_FLUSH;
  const table = readLuaTable(machine, a);
  for (let index = 1; index <= b; index++) writeLuaTableEntry(table, offset + index, machine.registers[a + index]);
  return programCounter + (hasExtraArgument ? 2 : 1);
};

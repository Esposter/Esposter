import type { LuaDataMachine } from "#src/models/recreation/lua/LuaDataMachine";

import { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import { LuaTable } from "#src/models/recreation/lua/LuaTable";
import { LUA_CHUNK_NAME } from "#src/services/recreation/lua/constants";
import { decodeLuaInstruction } from "#src/services/recreation/lua/decodeLuaInstruction";
import { readLuaConstantAt } from "#src/services/recreation/lua/readLuaConstantAt";
import { readLuaExtraArgument } from "#src/services/recreation/lua/readLuaExtraArgument";
import { readLuaOpcodeName } from "#src/services/recreation/lua/readLuaOpcodeName";
import { readLuaOperand } from "#src/services/recreation/lua/readLuaOperand";
import { readLuaTable } from "#src/services/recreation/lua/readLuaTable";
import { setLuaListEntries } from "#src/services/recreation/lua/setLuaListEntries";
import { writeLuaTableEntry } from "#src/services/recreation/lua/writeLuaTableEntry";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Runs the instruction at a pc and returns the next pc, or undefined once the chunk returns
// Only what a table constructor and its global assignments compile to is run; any other opcode throws, since it is logic and not data
export const executeLuaDataInstruction = (machine: LuaDataMachine, programCounter: number): number | undefined => {
  const word = machine.luaFunction.instructions[programCounter];
  if (word === undefined)
    throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `runs past its code at pc ${programCounter}`);
  const { a, b, bx, c, opcode: dialectOpcode } = decodeLuaInstruction(word);
  const opcode = machine.dialect.opcodes[dialectOpcode];
  if (opcode === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      LUA_CHUNK_NAME,
      `opcode ${dialectOpcode} at pc ${programCounter} is unknown to ${machine.dialect.name}`,
    );
  switch (opcode) {
    case LuaOpcode.GetTableUpvalue: {
      const key = readLuaOperand(machine, c);
      const value = machine.environment.get(key);
      if (value === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          LUA_CHUNK_NAME,
          `pc ${programCounter} reads global ${JSON.stringify(key)} before any assignment sets it`,
        );
      machine.registers[a] = value;
      return programCounter + 1;
    }
    case LuaOpcode.LoadBoolean:
      machine.registers[a] = b !== 0;
      return programCounter + (c === 0 ? 1 : 2);
    case LuaOpcode.LoadConstant:
      machine.registers[a] = readLuaConstantAt(machine.luaFunction, bx);
      return programCounter + 1;
    case LuaOpcode.LoadConstantExtended:
      machine.registers[a] = readLuaConstantAt(machine.luaFunction, readLuaExtraArgument(machine, programCounter).ax);
      return programCounter + 2;
    case LuaOpcode.LoadNil:
      for (let register = a; register <= a + b; register++) machine.registers[register] = undefined;
      return programCounter + 1;
    case LuaOpcode.Move:
      machine.registers[a] = machine.registers[b];
      return programCounter + 1;
    case LuaOpcode.Negate: {
      const value = machine.registers[b];
      if (typeof value !== "number")
        throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `pc ${programCounter} negates a non-number`);
      machine.registers[a] = -value;
      return programCounter + 1;
    }
    case LuaOpcode.NewTable:
      machine.registers[a] = new LuaTable();
      return programCounter + 1;
    case LuaOpcode.Return:
      if (b !== 1)
        throw new InvalidOperationError(Operation.Read, LUA_CHUNK_NAME, `pc ${programCounter} returns values`);
      return undefined;
    case LuaOpcode.SetList:
      return setLuaListEntries(machine, programCounter);
    case LuaOpcode.SetTable:
      writeLuaTableEntry(readLuaTable(machine, a), readLuaOperand(machine, b), readLuaOperand(machine, c));
      return programCounter + 1;
    case LuaOpcode.SetTableUpvalue:
      writeLuaTableEntry(machine.environment, readLuaOperand(machine, b), readLuaOperand(machine, c));
      return programCounter + 1;
    default:
      throw new InvalidOperationError(
        Operation.Read,
        LUA_CHUNK_NAME,
        `opcode ${readLuaOpcodeName(opcode)} at pc ${programCounter} is logic, not table construction`,
      );
  }
};

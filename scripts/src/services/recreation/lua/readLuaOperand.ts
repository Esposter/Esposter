import type { LuaDataMachine } from "#src/models/recreation/lua/LuaDataMachine";
import type { LuaValue } from "#src/models/recreation/lua/LuaValue";

import { LUA_CONSTANT_FLAG } from "#src/services/recreation/lua/constants";
import { readLuaConstantAt } from "#src/services/recreation/lua/readLuaConstantAt";

// A B or C operand is a register, or a constant when its flag bit is set
export const readLuaOperand = (machine: LuaDataMachine, operand: number): LuaValue =>
  operand & LUA_CONSTANT_FLAG
    ? readLuaConstantAt(machine.luaFunction, operand & ~LUA_CONSTANT_FLAG)
    : machine.registers[operand];

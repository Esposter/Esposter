import type { LuaConstant } from "#src/models/recreation/lua/LuaConstant";
import type { LuaLocalVariable } from "#src/models/recreation/lua/LuaLocalVariable";
import type { LuaUpvalue } from "#src/models/recreation/lua/LuaUpvalue";

// A function prototype of a binary chunk; its nested functions and debug information are kept as read
export interface LuaFunction {
  constants: LuaConstant[];
  instructions: number[];
  isVararg: boolean;
  lastLineDefined: number;
  lineDefined: number;
  lineInformation: number[];
  localVariables: LuaLocalVariable[];
  maxStackSize: number;
  numParameters: number;
  prototypes: LuaFunction[];
  source: string;
  upvalueNames: string[];
  upvalues: LuaUpvalue[];
}

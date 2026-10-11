import type { LuaFunction } from "#src/models/lua/LuaFunction";

// A chunk's main function and every prototype nested in it, depth first
export const flattenLuaFunctions = (luaFunction: LuaFunction): LuaFunction[] => [
  luaFunction,
  ...luaFunction.prototypes.flatMap((prototype) => flattenLuaFunctions(prototype)),
];

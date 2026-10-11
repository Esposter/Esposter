import type { LuaOpcodeRule } from "#src/models/lua/LuaOpcodeRule";

import { LuaOpcode } from "#src/models/lua/LuaOpcode";
import { LUA_FIELDS_PER_FLUSH } from "#src/services/lua/constants";

// The data-shaped stock opcodes' constraints, in the order they decide: _ENV's assignment and the return first, then
// The table writers, then the constructor and the loader, which name the writers
export const getLuaOpcodeRules = (): LuaOpcodeRule[] => [
  {
    describe: (statistic) =>
      statistic.aMax === 0 && statistic.rkBCount === statistic.count
        ? `A is 0 (_ENV) in all ${statistic.count} and B a constant key in all`
        : undefined,
    stockOpcode: LuaOpcode.SetTableUpvalue,
  },
  {
    describe: (statistic, context) =>
      statistic.count === context.functionCount && statistic.lastInFunctionCount === statistic.count
        ? `last instruction of each of ${context.functionCount} functions`
        : undefined,
    stockOpcode: LuaOpcode.Return,
  },
  {
    describe: (statistic) =>
      statistic.aMax > 0 && statistic.rkBCount > 0
        ? `B a constant in ${statistic.rkBCount} of ${statistic.count}, A over registers ${statistic.aMin}..${statistic.aMax}`
        : undefined,
    stockOpcode: LuaOpcode.SetTable,
  },
  {
    describe: (statistic) =>
      statistic.bMin >= 1 && statistic.bMax <= LUA_FIELDS_PER_FLUSH && statistic.cMin >= 1 && statistic.rkBCount === 0
        ? `B is ${statistic.bMin}..${statistic.bMax} values and C ${statistic.cMin}..${statistic.cMax} blocks in all ${statistic.count}`
        : undefined,
    stockOpcode: LuaOpcode.SetList,
  },
  {
    describe: (statistic, context) => {
      if (statistic.rkBCount > 0 || statistic.rkCCount > 0) return undefined;
      const namers = Object.entries(statistic.nextSameAOpcodes);
      const isSetOnly = namers.every(([opcode]) => context.setDialectOpcodes.includes(opcode));
      const namedCount = namers.reduce((total, [, count]) => total + count, 0);
      return isSetOnly && namedCount > 0
        ? `the next instruction naming its A is a table write in ${namedCount} of ${statistic.count}`
        : undefined;
    },
    stockOpcode: LuaOpcode.NewTable,
  },
  {
    describe: (statistic) =>
      statistic.bxBelowConstantsCount === statistic.count
        ? `Bx below its function's constant count in all ${statistic.count}`
        : undefined,
    stockOpcode: LuaOpcode.LoadConstant,
  },
];

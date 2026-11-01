import type { LuaOpcodeStatistic } from "#src/models/recreation/lua/LuaOpcodeStatistic";

export const createStatistic = (opcode: number): LuaOpcodeStatistic => ({
  aMax: 0,
  aMin: Number.POSITIVE_INFINITY,
  bMax: 0,
  bMin: Number.POSITIVE_INFINITY,
  bxBelowConstantsCount: 0,
  bxMax: 0,
  bxMin: Number.POSITIVE_INFINITY,
  cMax: 0,
  cMin: Number.POSITIVE_INFINITY,
  count: 0,
  lastInFunctionCount: 0,
  nextSameAOpcodes: {},
  opcode,
  rkBCount: 0,
  rkCCount: 0,
});

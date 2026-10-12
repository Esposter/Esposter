import type { LuaOpcodeStatistic } from "#src/models/lua/LuaOpcodeStatistic";

import { LuaOpcode } from "#src/models/lua/LuaOpcode";
import { proposeLuaOpcodeMapping } from "#src/services/lua/proposeLuaOpcodeMapping";
import { describe, expect, test } from "vitest";

const createStatistic = (statistic: Partial<LuaOpcodeStatistic> & Pick<LuaOpcodeStatistic, "opcode">) => ({
  aMax: 0,
  aMin: 0,
  bMax: 0,
  bMin: 0,
  bxBelowConstantsCount: 0,
  bxMax: 0,
  bxMin: 0,
  cMax: 0,
  cMin: 0,
  count: 2,
  lastInFunctionCount: 0,
  nextSameAOpcodes: {},
  rkBCount: 0,
  rkCCount: 0,
  ...statistic,
});

describe(proposeLuaOpcodeMapping, () => {
  test("names the constructor by the table write its A next meets", () => {
    expect.hasAssertions();
    const setTable = createStatistic({ aMax: 2, aMin: 1, opcode: 31, rkBCount: 2 });
    const newTable = createStatistic({ aMax: 1, aMin: 1, nextSameAOpcodes: { [setTable.opcode]: 2 }, opcode: 43 });
    const proposals = proposeLuaOpcodeMapping([setTable, newTable], 1);
    expect(proposals.map(({ stockOpcode }) => stockOpcode)).toStrictEqual([LuaOpcode.SetTable, LuaOpcode.NewTable]);
  });
});

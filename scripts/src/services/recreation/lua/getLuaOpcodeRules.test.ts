import { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import { createStatistic } from "#src/services/recreation/lua/createStatistic";
import { getLuaOpcodeRules } from "#src/services/recreation/lua/getLuaOpcodeRules";
import { assert, describe, expect, test } from "vitest";

describe(getLuaOpcodeRules, () => {
  test("names the table constructor whose register the next instruction writes as a table", () => {
    expect.hasAssertions();

    const setTableOpcode = 9;
    const rule = getLuaOpcodeRules().find(({ stockOpcode }) => stockOpcode === LuaOpcode.NewTable);
    assert.exists(rule);
    const statistic = { ...createStatistic(0), count: 1, nextSameAOpcodes: { [setTableOpcode]: 1 } };

    expect(rule.describe(statistic, { functionCount: 1, setDialectOpcodes: [setTableOpcode] })).toBe(
      "the next instruction naming its A is a table write in 1 of 1",
    );
  });
});

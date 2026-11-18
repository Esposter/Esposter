import { parseLuaTable } from "#src/services/genshinAssets/enemies/parseLuaTable";
import { describe, expect, test } from "vitest";

describe(parseLuaTable, () => {
  test("reads named fields as an object and positional values as an array, each nested at any depth", () => {
    expect.hasAssertions();

    expect(
      parseLuaTable(`return {
        -- a comment to the end of its line
        Enemies = {
          { members = {'Hilichurls'}, mora = 32, nums = { 0.4202, 1 }, names = {"Recruit's Insignia", 'Raw Meat'} },
          {},
        },
        Rates = { '0.425', '1–4' },
      }`),
    ).toStrictEqual({
      Enemies: [
        { members: ["Hilichurls"], mora: 32, names: ["Recruit's Insignia", "Raw Meat"], nums: [0.4202, 1] },
        [],
      ],
      Rates: ["0.425", "1–4"],
    });
  });

  test("keeps the positional values of a table that also names fields under their own indices", () => {
    expect.hasAssertions();

    expect(parseLuaTable("return { 'Inactivated', 'Dormant', condition = 'Activated/Scorched' }")).toStrictEqual({
      1: "Inactivated",
      2: "Dormant",
      condition: "Activated/Scorched",
    });
  });

  test("reads a quoted key in brackets as a field, and true and false as booleans", () => {
    expect.hasAssertions();

    expect(
      parseLuaTable(`return {
        ['Base_Info'] = { ['type-1'] = { Mora = '≤200' } },
        Enemies = { { members = {'Avatar of Lava'}, artifacts = true, hidden = false } },
      }`),
    ).toStrictEqual({
      Base_Info: { "type-1": { Mora: "≤200" } },
      Enemies: [{ artifacts: true, hidden: false, members: ["Avatar of Lava"] }],
    });
  });

  test("a quoted brace is a string, not the end of its table", () => {
    expect.hasAssertions();

    expect(parseLuaTable("return { 'a', '}' }")).toStrictEqual(["a", "}"]);
  });

  test("fails on text after the literal's closing brace", () => {
    expect.hasAssertions();

    expect(() => parseLuaTable("return { 'a' } junk")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a Lua table, has text after its closing brace]`,
    );
  });
});

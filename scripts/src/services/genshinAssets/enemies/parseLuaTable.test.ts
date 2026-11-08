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

  test("fails on a table holding both named fields and positional values", () => {
    expect.hasAssertions();

    expect(() => parseLuaTable("return { name = 'a', 'b' }")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a Lua table, mixes named fields and positional values]`,
    );
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

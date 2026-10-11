import { CALL_CHUNK, GENSHIN_CHUNK, POINTS_CHUNK } from "#src/services/recreation/lua/constants.test";
import { GENSHIN_LUA_53 } from "#src/services/genshinAssets/lua/GENSHIN_LUA_53";
import { readLuaChunk } from "#src/services/recreation/lua/readLuaChunk";
import { STOCK_LUA_53 } from "#src/services/recreation/lua/STOCK_LUA_53";
import { describe, expect, test } from "vitest";

describe(readLuaChunk, () => {
  test("reads the constants, instructions and upvalue names a hand-built chunk holds", () => {
    expect.hasAssertions();
    const { constants, instructions, upvalueNames } = readLuaChunk(POINTS_CHUNK, STOCK_LUA_53);
    expect(constants).toStrictEqual(["a", "pos", "x", 1.5, "y", -2, "points"]);
    expect(instructions).toStrictEqual([
      0x400b, 0x404b, 0x808b, 0xc0c1, 0x8100c08a, 0x8241408a, 0x8080804a, 0x8000400a, 0x83000008, 0x800026,
    ]);
    expect(upvalueNames).toStrictEqual(["_ENV"]);
  });

  test("reads a genshin chunk's instructions as their dialect numbers, unmapped", () => {
    expect.hasAssertions();
    const { constants, instructions } = readLuaChunk(GENSHIN_CHUNK, GENSHIN_LUA_53);
    expect(constants).toStrictEqual([2.5, "a", "points"]);
    expect(instructions).toStrictEqual([0x2b, 0x56, 0x8080401f, 0x81000022, 0x800019]);
  });

  test("reads a chunk whose main function calls, leaving the call to the evaluator to refuse", () => {
    expect.hasAssertions();
    expect(readLuaChunk(CALL_CHUNK, STOCK_LUA_53).instructions).toStrictEqual([0x804024, 0x800026]);
  });

  test("throws on a format byte other than the dialect's", () => {
    expect.hasAssertions();
    expect(() => readLuaChunk(POINTS_CHUNK.with(5, 0x01), STOCK_LUA_53)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: lua chunk, format is 1, not 0]`,
    );
  });

  test("throws on a stock chunk read as the genshin dialect, whose header records fewer sizes", () => {
    expect.hasAssertions();
    expect(() => readLuaChunk(POINTS_CHUNK, GENSHIN_LUA_53)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: lua chunk, format is 0, not 1]`,
    );
  });
});

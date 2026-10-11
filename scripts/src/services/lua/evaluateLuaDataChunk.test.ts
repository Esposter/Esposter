import { CALL_CHUNK, GENSHIN_CHUNK, POINTS_CHUNK } from "#src/services/lua/constants.test";
import { evaluateLuaDataChunk } from "#src/services/lua/evaluateLuaDataChunk";
import { GENSHIN_LUA_53 } from "#src/services/lua/GENSHIN_LUA_53";
import { readLuaChunk } from "#src/services/lua/readLuaChunk";
import { STOCK_LUA_53 } from "#src/services/lua/STOCK_LUA_53";
import { describe, expect, test } from "vitest";

describe(evaluateLuaDataChunk, () => {
  test("returns the globals a table-constructing stock chunk sets, its tables as objects", () => {
    expect.hasAssertions();
    expect(evaluateLuaDataChunk(readLuaChunk(POINTS_CHUNK, STOCK_LUA_53), STOCK_LUA_53)).toStrictEqual({
      points: { a: { pos: { x: 1.5, y: -2 } } },
    });
  });

  test("returns the globals a genshin-dialect chunk sets, its opcodes mapped through the dialect", () => {
    expect.hasAssertions();
    expect(evaluateLuaDataChunk(readLuaChunk(GENSHIN_CHUNK, GENSHIN_LUA_53), GENSHIN_LUA_53)).toStrictEqual({
      points: { a: 2.5 },
    });
  });

  test("throws on a stock opcode that is logic, naming it and its pc", () => {
    expect.hasAssertions();
    expect(() =>
      evaluateLuaDataChunk(readLuaChunk(CALL_CHUNK, STOCK_LUA_53), STOCK_LUA_53),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: lua chunk, opcode Call at pc 0 is logic, not table construction]`,
    );
  });

  test("throws on a dialect opcode the dialect does not map, naming the number and its pc", () => {
    expect.hasAssertions();
    expect(() =>
      evaluateLuaDataChunk(readLuaChunk(GENSHIN_CHUNK.with(53, 0x02), GENSHIN_LUA_53), GENSHIN_LUA_53),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: lua chunk, opcode 2 at pc 1 is unknown to genshin Lua 5.3]`,
    );
  });
});

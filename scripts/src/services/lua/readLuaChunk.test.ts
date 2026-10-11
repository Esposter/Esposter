import { CALL_CHUNK, POINTS_CHUNK } from "#src/services/lua/constants.test";
import { readLuaChunk } from "#src/services/lua/readLuaChunk";
import { describe, expect, test } from "vitest";

describe(readLuaChunk, () => {
  test("reads the constants, instructions and upvalue names a hand-built chunk holds", () => {
    expect.hasAssertions();
    const { constants, instructions, upvalueNames } = readLuaChunk(POINTS_CHUNK);
    expect(constants).toStrictEqual(["a", "pos", "x", 1.5, "y", -2, "points"]);
    expect(instructions).toStrictEqual([
      0x400b, 0x404b, 0x808b, 0xc0c1, 0x8100c08a, 0x8241408a, 0x8080804a, 0x8000400a, 0x83000008, 0x800026,
    ]);
    expect(upvalueNames).toStrictEqual(["_ENV"]);
  });
  test("reads a chunk whose main function calls, leaving the call to the evaluator to refuse", () => {
    expect.hasAssertions();
    expect(readLuaChunk(CALL_CHUNK).instructions).toStrictEqual([0x804024, 0x800026]);
  });
  test("throws on a format byte other than Lua 5.3's", () => {
    expect.hasAssertions();
    expect(() => readLuaChunk(POINTS_CHUNK.with(5, 0x01))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: lua chunk, format is 1, not 0]`,
    );
  });
});

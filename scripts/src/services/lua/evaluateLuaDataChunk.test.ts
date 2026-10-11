import { CALL_CHUNK, POINTS_CHUNK } from "#src/services/lua/constants.test";
import { evaluateLuaDataChunk } from "#src/services/lua/evaluateLuaDataChunk";
import { readLuaChunk } from "#src/services/lua/readLuaChunk";
import { describe, expect, test } from "vitest";

describe(evaluateLuaDataChunk, () => {
  test("returns the globals a table-constructing chunk sets, its tables as objects", () => {
    expect.hasAssertions();
    expect(evaluateLuaDataChunk(readLuaChunk(POINTS_CHUNK))).toStrictEqual({
      points: { a: { pos: { x: 1.5, y: -2 } } },
    });
  });
  test("throws on an opcode that is logic, naming it and its pc", () => {
    expect.hasAssertions();
    expect(() => evaluateLuaDataChunk(readLuaChunk(CALL_CHUNK))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: lua chunk, opcode Call at pc 0 is logic, not table construction]`,
    );
  });
});

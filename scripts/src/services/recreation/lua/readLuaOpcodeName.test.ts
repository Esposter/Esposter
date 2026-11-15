import { LuaOpcode } from "#src/models/recreation/lua/LuaOpcode";
import { readLuaOpcodeName } from "#src/services/recreation/lua/readLuaOpcodeName";
import { describe, expect, test } from "vitest";

describe(readLuaOpcodeName, () => {
  test("names an opcode by its number", () => {
    expect.hasAssertions();

    expect(readLuaOpcodeName(LuaOpcode.Move)).toBe("Move");
    expect(readLuaOpcodeName(LuaOpcode.ExtraArgument)).toBe("ExtraArgument");
  });

  test("writes the number of an opcode the instruction set has no name for", () => {
    expect.hasAssertions();

    const opcode = LuaOpcode.ExtraArgument + 1;

    expect(readLuaOpcodeName(opcode)).toBe(String(opcode));
  });
});

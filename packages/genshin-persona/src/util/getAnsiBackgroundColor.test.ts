import { getAnsiBackgroundColor } from "#src/util/getAnsiBackgroundColor";
import { describe, expect, test } from "vitest";

describe(getAnsiBackgroundColor, () => {
  test("spells a hex triplet as the truecolor background escape", () => {
    expect.hasAssertions();

    expect(getAnsiBackgroundColor("#010203")).toBe("\u001B[48;2;1;2;3m");
  });
});

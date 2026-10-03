import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { describe, expect, test } from "vitest";

describe(getAnsiForegroundColor, () => {
  test("spells a hex triplet as the truecolor foreground escape", () => {
    expect.hasAssertions();

    expect(getAnsiForegroundColor("#010203")).toBe("\u001B[38;2;1;2;3m");
  });
});

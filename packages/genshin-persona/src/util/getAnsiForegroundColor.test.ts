import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { describe, expect, test } from "vitest";

describe(getAnsiForegroundColor, () => {
  test("spells a hex triplet as the truecolor foreground escape", () => {
    expect.hasAssertions();

    expect(getAnsiForegroundColor("#d376f0")).toBe("\u001B[38;2;211;118;240m");
  });
});

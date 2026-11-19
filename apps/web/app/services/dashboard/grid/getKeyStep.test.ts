// @vitest-environment happy-dom
import { getKeyStep } from "#src/services/dashboard/grid/getKeyStep";
import { describe, expect, test } from "vitest";

describe(getKeyStep, () => {
  test("an arrow key moves a focused visual one cell, and with Shift resizes it one cell instead", () => {
    expect.hasAssertions();

    expect(getKeyStep(new KeyboardEvent("keydown", { key: "ArrowRight" }))).toStrictEqual({ dx: 1 });
    expect(getKeyStep(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }))).toStrictEqual({ dw: 1 });
  });

  test("a key that is not an arrow takes no step", () => {
    expect.hasAssertions();

    expect(getKeyStep(new KeyboardEvent("keydown", { key: "a" }))).toBeUndefined();
  });
});

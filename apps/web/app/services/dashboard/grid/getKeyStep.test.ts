// @vitest-environment happy-dom
import { getKeyStep } from "@/services/dashboard/grid/getKeyStep";
import { describe, expect, test } from "vitest";

describe("getKeyStep", () => {
  test.each([
    ["ArrowDown", { dy: 1 }],
    ["ArrowLeft", { dx: -1 }],
    ["ArrowRight", { dx: 1 }],
    ["ArrowUp", { dy: -1 }],
  ])("an arrow key moves a focused visual one cell: %s", (key, step) => {
    expect.hasAssertions();

    expect(getKeyStep(new KeyboardEvent("keydown", { key }))).toStrictEqual(step);
  });

  test.each([
    ["ArrowDown", { dh: 1 }],
    ["ArrowLeft", { dw: -1 }],
    ["ArrowRight", { dw: 1 }],
    ["ArrowUp", { dh: -1 }],
  ])("shift with an arrow key resizes a focused visual one cell: %s", (key, step) => {
    expect.hasAssertions();

    expect(getKeyStep(new KeyboardEvent("keydown", { key, shiftKey: true }))).toStrictEqual(step);
  });

  test("a key that is not an arrow takes no step", () => {
    expect.hasAssertions();

    expect(getKeyStep(new KeyboardEvent("keydown", { key: "a" }))).toBeUndefined();
  });
});

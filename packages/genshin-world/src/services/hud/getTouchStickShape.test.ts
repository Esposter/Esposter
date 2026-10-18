import { TouchStickShape } from "#src/models/hud/TouchStickShape";
import { getTouchStickShape } from "#src/services/hud/getTouchStickShape";
import { describe, expect, test } from "vitest";

describe(getTouchStickShape, () => {
  test("a 16:9 screen is the 16:9 shape", () => {
    expect.hasAssertions();

    expect(getTouchStickShape(16 / 9)).toBe(TouchStickShape.Ratio16x9);
  });

  test("a 19.5:9 screen is the 19.5:9 shape", () => {
    expect.hasAssertions();

    expect(getTouchStickShape(19.5 / 9)).toBe(TouchStickShape.Ratio19Point5x9);
  });

  test("a 20:9 screen is the 20:9 shape", () => {
    expect.hasAssertions();

    expect(getTouchStickShape(20 / 9)).toBe(TouchStickShape.Ratio20x9);
  });

  test("a screen between two recorded shapes takes the nearer one", () => {
    expect.hasAssertions();

    expect(getTouchStickShape(18.5 / 9)).toBe(TouchStickShape.Ratio19Point5x9);
    expect(getTouchStickShape(21 / 9)).toBe(TouchStickShape.Ratio20x9);
  });

  test("a screen narrower than 16:9 takes the 16:9 shape", () => {
    expect.hasAssertions();

    expect(getTouchStickShape(4 / 3)).toBe(TouchStickShape.Ratio16x9);
  });

  test("a window with no size yet takes the 16:9 shape", () => {
    expect.hasAssertions();

    expect(getTouchStickShape(Number.NaN)).toBe(TouchStickShape.Ratio16x9);
  });
});

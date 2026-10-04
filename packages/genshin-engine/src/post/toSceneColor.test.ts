import { toSceneColor } from "#src/post/toSceneColor";
import { Color } from "three";
import { describe, expect, test } from "vitest";

describe(toSceneColor, () => {
  test("adds back the toe's offset below the compression", () => {
    expect.hasAssertions();

    const { b, g, r } = toSceneColor(new Color(0.3, 0.4, 0.5));

    expect(r).toBeCloseTo(0.34);
    expect(g).toBeCloseTo(0.44);
    expect(b).toBeCloseTo(0.54);
  });

  test("writes into the colour given, which may be the measured colour itself", () => {
    expect.hasAssertions();

    const color = new Color(0.3, 0.4, 0.5);

    expect(toSceneColor(color, color)).toBe(color);
    expect(color.r).toBeCloseTo(0.34);
  });

  test("lifts a bright colour past what the compression holds back", () => {
    expect.hasAssertions();

    const { b } = toSceneColor(new Color(0.1, 0.46, 0.94));

    expect(b).toBeGreaterThan(1);
  });

  test("stops a white the tone mapping cannot reach at a bounded scene colour", () => {
    expect.hasAssertions();

    const { r } = toSceneColor(new Color(1, 1, 1));

    expect(r).toBeLessThanOrEqual(1.5);
  });
});

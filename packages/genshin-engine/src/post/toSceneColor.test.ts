import { toneMapGenshin } from "#src/post/toneMapGenshin";
import { toSceneColor } from "#src/post/toSceneColor";
import { TONE_CURVE_LIFT } from "#src/renderer/constants";
import { Color } from "three";
import { describe, expect, test } from "vitest";

describe(toSceneColor, () => {
  test("takes a colour the tone curve shows back to the scene colour it showed", () => {
    expect.hasAssertions();

    const sceneColor: [number, number, number] = [0.1, 1, 3];
    const { b, g, r } = toSceneColor(new Color(...toneMapGenshin(sceneColor)));

    expect(r).toBeCloseTo(sceneColor[0]);
    expect(g).toBeCloseTo(sceneColor[1]);
    expect(b).toBeCloseTo(sceneColor[2]);
  });

  test("writes into the colour given, which may be the measured colour itself", () => {
    expect.hasAssertions();

    const color = new Color(...toneMapGenshin([1, 1, 1]));

    expect(toSceneColor(color, color)).toBe(color);
    expect(color.r).toBeCloseTo(1);
  });

  test("brings a measured white back as the brightest scene colour the curve's lift tells from white", () => {
    expect.hasAssertions();

    expect(toSceneColor(new Color(1, 1, 1)).r).toBeCloseTo(-Math.log2(TONE_CURVE_LIFT));
  });
});

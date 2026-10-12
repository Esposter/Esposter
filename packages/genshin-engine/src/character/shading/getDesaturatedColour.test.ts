import { getDesaturatedColour } from "#src/character/shading/getDesaturatedColour";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(getDesaturatedColour, () => {
  test("keeps the colour at no desaturation", () => {
    expect.hasAssertions();

    expect(getDesaturatedColour(new Vector3(0.2, 0.4, 0.6), 0)).toStrictEqual(new Vector3(0.2, 0.4, 0.6));
  });

  test("draws the colour to its luminance by the page's weights at full desaturation", () => {
    expect.hasAssertions();

    const grey = getDesaturatedColour(new Vector3(1, 0, 0), 1);

    expect(grey.x).toBeCloseTo(0.0397);
    expect(grey.y).toBeCloseTo(0.0397);
    expect(grey.z).toBeCloseTo(0.0397);
  });
});

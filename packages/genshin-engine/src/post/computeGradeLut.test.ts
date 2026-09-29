import { computeGradeLut } from "#src/post/computeGradeLut";
import { describe, expect, test } from "vitest";

describe(computeGradeLut, () => {
  test("is the identity at neutral values", () => {
    expect.hasAssertions();

    expect(
      computeGradeLut({ contrast: 1, highlightTint: [0, 0, 0], saturation: 1, shadowTint: [0, 0, 0], size: 2 }),
    ).toStrictEqual(
      Uint8Array.from([
        0, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 255, 255, 0, 255, 0, 0, 255, 255, 255, 0, 255, 255, 0, 255, 255,
        255, 255, 255, 255, 255,
      ]),
    );
  });

  test("greys by luminance and tints the shadows without reaching white", () => {
    expect.hasAssertions();

    expect(
      computeGradeLut({ contrast: 1, highlightTint: [0, 0, 0], saturation: 0, shadowTint: [0, 0, 1], size: 2 }),
    ).toStrictEqual(
      Uint8Array.from([
        0, 0, 255, 255, 54, 54, 212, 255, 182, 182, 203, 255, 237, 237, 238, 255, 18, 18, 238, 255, 73, 73, 203, 255,
        201, 201, 212, 255, 255, 255, 255, 255,
      ]),
    );
  });
});

import { splitGlyph } from "#src/services/genshinParity/shared/splitGlyph";
import { describe, expect, test } from "vitest";

describe(splitGlyph, () => {
  test("takes a pixel for ink by the glyph's colour, so a ground colour far from the rest stays ground", () => {
    expect.hasAssertions();

    const ink = [240, 250, 250];
    const terrain = [170, 210, 215];
    const water = [40, 150, 230];
    const stroke = [235, 248, 249];
    const data = Uint8Array.from([terrain, terrain, stroke, terrain, water, stroke, terrain].flat());

    expect(splitGlyph(data, 3, data.length / 3, 1, ink)).toStrictEqual(Uint8Array.from([0, 0, 1, 0, 0, 1, 0]));
  });

  test("takes the ground from the box's border, so a glyph covering over half its box keeps its paper", () => {
    expect.hasAssertions();

    const ink = [240, 250, 250];
    const paper = [170, 210, 215];
    const size = 7;
    const pixelCount = size * size;
    const isInterior = (pixel: number): boolean => {
      const x = pixel % size;
      const y = Math.floor(pixel / size);
      return x > 0 && x < size - 1 && y > 0 && y < size - 1;
    };
    const data = Uint8Array.from(
      Array.from({ length: pixelCount }, (_value, pixel) => (isInterior(pixel) ? ink : paper)).flat(),
    );

    expect(splitGlyph(data, 3, size, size, ink)).toStrictEqual(
      Uint8Array.from({ length: pixelCount }, (_value, pixel) => Number(isInterior(pixel))),
    );
  });
});

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

    expect(splitGlyph(data, 3, data.length / 3, 1, ink, terrain)).toStrictEqual(Uint8Array.from([0, 0, 1, 0, 0, 1, 0]));
  });
});

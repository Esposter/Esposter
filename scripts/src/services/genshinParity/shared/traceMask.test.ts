import { parseSvgPath } from "#src/services/genshinParity/shared/parseSvgPath";
import { traceMask } from "#src/services/genshinParity/shared/traceMask";
import { describe, expect, test } from "vitest";

describe(traceMask, () => {
  test("scales each coordinate to the caller's units, and its paths joined keep their places", () => {
    expect.hasAssertions();

    const size = 20;
    // Two squares of ink apart on the mask, the first over pixels 2 to 7 and the second over 12 to 17
    const isInk = Uint8Array.from({ length: size * size }, (_value, pixel) => {
      const x = pixel % size;
      const y = Math.floor(pixel / size);
      return Number((x >= 2 && x < 8 && y >= 2 && y < 8) || (x >= 12 && x < 18 && y >= 12 && y < 18));
    });
    const { scale, segments } = parseSvgPath(traceMask(isInk, size, size, { unitsPerPixel: 0.5 }).join(" "));
    const xs = segments
      .flatMap(({ values }) => values.filter((_value, index) => index % 2 === 0))
      .map((x) => x / scale);

    expect([Math.min(...xs), Math.max(...xs)]).toStrictEqual([1, 9]);
  });
});

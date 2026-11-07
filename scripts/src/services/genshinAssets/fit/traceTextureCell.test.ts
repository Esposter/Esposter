import { traceTextureCell } from "#src/services/genshinAssets/fit/traceTextureCell";
import { describe, expect, test } from "vitest";

describe(traceTextureCell, () => {
  test("a cell not at the texture's origin is traced from its own texels, in its own unit square", () => {
    expect.hasAssertions();

    const textureSize = 128;
    const data = Buffer.alloc(textureSize * textureSize * 4);
    // Only the right half is painted, so a cell read from the texture's origin would find nothing
    for (let y = 0; y < textureSize; y++)
      for (let x = textureSize / 2; x < textureSize; x++) data[(y * textureSize + x) * 4 + 3] = 255;
    const loops = traceTextureCell(
      data,
      { channels: 4, width: textureSize },
      {
        cell: { foot: textureSize, height: textureSize, left: textureSize / 2, width: textureSize / 2 },
        checkPainted: (texel) => data[texel + 3] !== 0,
        texels: 4,
        tolerance: 1,
      },
    );

    expect(loops).toHaveLength(1);
    const points = loops.flat();
    expect(Math.min(...points.map(([x]) => x))).toBe(0);
    expect(Math.max(...points.map(([x]) => x))).toBe(1);
    expect(Math.min(...points.map(([, y]) => y))).toBe(0);
    expect(Math.max(...points.map(([, y]) => y))).toBe(1);
  });
});

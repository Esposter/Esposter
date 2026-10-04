import { scoreStructure } from "#src/services/genshinParity/reference/scoreStructure";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(scoreStructure, () => {
  const size = 480;
  // A dark bar on white, at a left edge given in pixels, as a scene's pillar would stand
  const drawBar = (left: number): Promise<Buffer> =>
    sharp({ create: { background: "#fff", channels: 3, height: size, width: size } })
      .composite([
        {
          input: { create: { background: "#000", channels: 3, height: size / 2, width: size / 8 } },
          left,
          top: size / 4,
        },
      ])
      .png()
      .toBuffer();

  test("scores an image against itself as identical", async () => {
    expect.hasAssertions();

    const bar = await drawBar(size / 4);

    await expect(scoreStructure(bar, bar)).resolves.toStrictEqual({ edgeScore: 1, toneDifference: 0 });
  });

  test("scores a shape moved past the tolerance as sharing no edge", async () => {
    expect.hasAssertions();

    const { edgeScore, toneDifference } = await scoreStructure(await drawBar(size / 4), await drawBar(size / 2));

    expect(edgeScore).toBe(0);
    expect(toneDifference).toBeGreaterThan(0);
  });
});

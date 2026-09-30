import { fitHorizonBand } from "#src/services/genshinAssets/fitHorizonBand";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(fitHorizonBand, () => {
  const width = 100;
  const band = 0.6;

  test("finds where a gradient's red falls to nothing", async () => {
    expect.hasAssertions();

    const data = Buffer.alloc(width * 3);
    for (let x = 0; x < width; x++) {
      const t = Math.min(x / (width - 1) / band, 1);
      data[x * 3] = Math.round((1 - t * t * (3 - 2 * t)) * 255);
    }
    const gradient = await sharp(data, { raw: { channels: 3, height: 1, width } })
      .png()
      .toBuffer();

    await expect(fitHorizonBand(gradient)).resolves.toBe(band);
  });
});

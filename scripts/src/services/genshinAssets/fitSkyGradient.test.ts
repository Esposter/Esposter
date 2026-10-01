import { fitSkyGradient } from "#src/services/genshinAssets/fitSkyGradient";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(fitSkyGradient, () => {
  test("samples the red and green across the width, both rows averaged", async () => {
    expect.hasAssertions();

    const width = 3;
    // Red falling from full to none across, green full on the top row and none on the bottom
    const pixels = Buffer.from([255, 255, 0, 128, 255, 0, 0, 255, 0, 255, 0, 0, 128, 0, 0, 0, 0, 0]);
    const gradient = await sharp(pixels, { raw: { channels: 3, height: 2, width } })
      .png()
      .toBuffer();
    const { green, red } = await fitSkyGradient(gradient);

    expect(red[0]).toBeCloseTo(1);
    expect(red[16]).toBeCloseTo(128 / 255);
    expect(red.at(-1)).toBeCloseTo(0);
    expect(green.every((value) => Math.abs(value - 0.5) < 0.01)).toBe(true);
  });
});

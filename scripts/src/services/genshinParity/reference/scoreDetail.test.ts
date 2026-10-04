import { scoreDetail } from "#src/services/genshinParity/reference/scoreDetail";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(scoreDetail, () => {
  const size = 480;
  const flat = (): Promise<Buffer> =>
    sharp({ create: { background: "#808080", channels: 3, height: size, width: size } })
      .png()
      .toBuffer();
  const striped = (): Promise<Buffer> => {
    const data = Buffer.alloc(size * size * 3);
    for (let index = 0; index < size * size; index++) data.fill(index % 4 < 2 ? 64 : 192, index * 3, index * 3 + 3);
    return sharp(data, { raw: { channels: 3, height: size, width: size } })
      .png()
      .toBuffer();
  };

  test("scores an image against itself as identical, and a flat one against a detailed one as not", async () => {
    expect.hasAssertions();

    const [flatImage, stripedImage] = await Promise.all([flat(), striped()]);

    await expect(scoreDetail(stripedImage, stripedImage)).resolves.toBe(0);
    await expect(scoreDetail(stripedImage, flatImage)).resolves.toBeGreaterThan(10);
  });
});

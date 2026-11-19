import { traceWeaponIcon } from "#src/services/genshinAssets/fit/traceWeaponIcon";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(traceWeaponIcon, () => {
  const iconWidth = 64;
  const iconHeight = 32;

  test("a traced icon outline is loops in its own unit square", async () => {
    expect.hasAssertions();

    const data = Buffer.alloc(iconWidth * iconHeight * 4);
    // The icon's left half painted whole and its right half left clear
    for (let y = 0; y < iconHeight; y++)
      for (let x = 0; x < iconWidth / 2; x++) data[(y * iconWidth + x) * 4 + 3] = 255;
    const icon = await sharp(data, { raw: { channels: 4, height: iconHeight, width: iconWidth } })
      .png()
      .toBuffer();
    const loops = await traceWeaponIcon(icon);

    expect(loops).toStrictEqual([
      [
        [0, 0],
        [0.5, 0],
        [0.5, 1],
        [0, 1],
      ],
    ]);
  });
});

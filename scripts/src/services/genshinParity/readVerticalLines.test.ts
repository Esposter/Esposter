import { STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { readVerticalLines } from "#src/services/genshinParity/readVerticalLines";
import sharp from "sharp";
import { describe, expect, test } from "vitest";

describe(readVerticalLines, () => {
  const height = 270;

  test("keeps a tower's sides and drops a cloud's rim", async () => {
    expect.hasAssertions();

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${STRUCTURE_WIDTH}" height="${height}">
      <rect width="100%" height="100%" fill="#fff"/>
      <rect x="100" y="40" width="40" height="200" fill="#000"/>
      <circle cx="340" cy="135" r="60" fill="#000"/>
    </svg>`;
    const image = await sharp(Buffer.from(svg)).png().toBuffer();
    const lines = await readVerticalLines(image, height);
    const columns = new Set<number>();
    for (const [index, isLine] of lines.entries()) if (isLine) columns.add(index % STRUCTURE_WIDTH);

    expect([...columns].every((column) => column < 200)).toBe(true);
    expect(columns.size).toBeGreaterThan(0);
  });
});

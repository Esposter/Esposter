import { parseTerrainHeights } from "#src/services/genshinAssets/world/parseTerrainHeights";
import { assert, describe, expect, test } from "vitest";

const writeUint32s = (...values: number[]): Buffer => {
  const bytes = Buffer.alloc(values.length * 4);
  for (const [index, value] of values.entries()) bytes.writeUInt32LE(value, index * 4);
  return bytes;
};
const writeFloats = (...values: number[]): Buffer => {
  const bytes = Buffer.alloc(values.length * 4);
  for (const [index, value] of values.entries()) bytes.writeFloatLE(value, index * 4);
  return bytes;
};

describe(parseTerrainHeights, () => {
  test("finds the heights by their shape past a square count that is not a side, in metres", () => {
    expect.hasAssertions();

    const resolution = 33;
    const samples = Buffer.alloc(resolution * resolution * 2);
    samples.writeInt16LE(32_766);
    const bytes = Buffer.concat([
      // A count that is a square, of a side that is not a power of two and one
      writeUint32s(34 * 34),
      writeUint32s(resolution * resolution),
      samples,
      // The heights end two bytes short of a word
      Buffer.alloc(2),
      writeUint32s(0, 0, resolution, resolution),
      writeFloats(1),
      writeUint32s(1),
      writeFloats(2, 4, 2),
    ]);
    const terrainHeights = parseTerrainHeights(bytes);

    assert.exists(terrainHeights);
    expect(terrainHeights.resolution).toBe(resolution);
    expect(terrainHeights.spacing).toBe(2);
    expect(terrainHeights.heights.slice(0, 2)).toStrictEqual(Float32Array.from([4, 0]));
  });

  test("finds nothing without a heightfield", () => {
    expect.hasAssertions();

    expect(parseTerrainHeights(Buffer.alloc(4))).toBeUndefined();
  });
});

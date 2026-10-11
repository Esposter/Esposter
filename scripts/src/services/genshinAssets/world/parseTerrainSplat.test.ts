import { parseTerrainSplat } from "#src/services/genshinAssets/world/parseTerrainSplat";
import { assert, describe, expect, test } from "vitest";

const writeUint32s = (...values: number[]): Buffer => {
  const bytes = Buffer.alloc(values.length * 4);
  for (const [index, value] of values.entries()) bytes.writeUInt32LE(value, index * 4);
  return bytes;
};
const writePointer = (fileIndex: number, pathId: bigint): Buffer => {
  const bytes = Buffer.alloc(12);
  bytes.writeInt32LE(fileIndex, 0);
  bytes.writeBigInt64LE(pathId, 4);
  return bytes;
};
const writeLayer = (pathId: bigint, tileSize: number, kind: number): Buffer => {
  const floats = Buffer.alloc(15 * 4);
  floats.writeFloatLE(tileSize, 0);
  floats.writeFloatLE(tileSize, 4);
  return Buffer.concat([
    writePointer(1, pathId),
    writePointer(2, 7n),
    writePointer(0, 0n),
    floats,
    writeUint32s(kind, kind),
  ]);
};
// A name of one character, padded to a word
const NAME = Buffer.concat([writeUint32s(1), Buffer.from("T\0\0\0")]);

describe(parseTerrainSplat, () => {
  test("reads each layer's texture, kind and tiling, and the cell map past a square too small to be one", () => {
    expect.hasAssertions();

    const resolution = 64;
    const cells = Buffer.alloc(resolution * resolution);
    // The cell one row along z from the corner
    cells[resolution] = 1;
    const splat = parseTerrainSplat(
      Buffer.concat([
        NAME,
        writeUint32s(2),
        writeLayer(-5n, 8, 1),
        writeLayer(9n, 15, 3),
        // One control map, then the resolutions, a count of 32 squared among them
        writeUint32s(1),
        writePointer(3, 11n),
        writeUint32s(1024, 1024),
        writeUint32s(resolution * resolution),
        cells,
      ]),
    );

    assert.exists(splat);
    expect(splat.layers).toStrictEqual([
      { diffusePathId: "-5", kind: 1, tileSize: 8 },
      { diffusePathId: "9", kind: 3, tileSize: 15 },
    ]);
    expect(splat.resolution).toBe(resolution);
    expect([splat.cells[0], splat.cells[resolution]]).toStrictEqual([0, 1]);
  });

  test("reads none from a tile listing no layers", () => {
    expect.hasAssertions();

    expect(parseTerrainSplat(Buffer.concat([NAME, writeUint32s(0)]))).toBeUndefined();
  });
});

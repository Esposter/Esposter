import { parseLodInfoMap } from "#src/services/genshinAssets/world/parseLodInfoMap";
import { describe, expect, test } from "vitest";

const writeUint32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32LE(value);
  return bytes;
};
const writeUint64 = (value: bigint): Buffer => {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64LE(value);
  return bytes;
};
// A record of the table: its key, the world id in its low four bytes, six words, its levels, then its tail
const writeRecord = (prefabId: number, levels: [number, bigint][]): Buffer =>
  Buffer.concat([
    writeUint32(prefabId),
    Buffer.alloc(4 + 24),
    writeUint32(levels.length),
    ...levels.flatMap(([level, pathHash]) => [writeUint32(level), writeUint64(pathHash), Buffer.alloc(4)]),
    Buffer.alloc(24),
  ]);

describe(parseLodInfoMap, () => {
  test("names each prefab by its finest level's path hash, past a record that names none", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([
      Buffer.alloc(28),
      writeUint32(1),
      Buffer.from("a\0\0\0"),
      writeUint32(2),
      writeRecord(0, []),
      writeRecord(1, [
        [9, 1n],
        [0, 2n ** 63n],
      ]),
    ]);

    expect(parseLodInfoMap(bytes)).toStrictEqual(new Map([[1, String(2n ** 63n)]]));
  });

  test("throws when the records do not end where the bytes do", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([
      Buffer.alloc(28),
      writeUint32(0),
      writeUint32(1),
      writeRecord(0, []),
      Buffer.alloc(1),
    ]);

    expect(() => parseLodInfoMap(bytes)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: LODFinInfoMap, 1 records end at byte 96 of 97]`,
    );
  });
});

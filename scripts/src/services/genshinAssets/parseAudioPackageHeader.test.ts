import { parseAudioPackageHeader } from "#src/services/genshinAssets/parseAudioPackageHeader";
import { describe, expect, test } from "vitest";

const createTable = (entries: { blocks: number; blockSize: number; id: number; size: number }[]): Buffer => {
  const table = Buffer.alloc(4 + entries.length * 20);
  table.writeUInt32LE(entries.length);
  for (const [index, { blocks, blockSize, id, size }] of entries.entries()) {
    table.writeUInt32LE(id, 4 + index * 20);
    table.writeUInt32LE(blockSize, 8 + index * 20);
    table.writeUInt32LE(size, 12 + index * 20);
    table.writeUInt32LE(blocks, 16 + index * 20);
  }
  return table;
};

describe(parseAudioPackageHeader, () => {
  test("reads the bank table after the language map, then the sound table, each offset in blocks", () => {
    expect.hasAssertions();

    const languageMap = Buffer.alloc(4);
    const banks = createTable([{ blocks: 2, blockSize: 16, id: 1, size: 3 }]);
    const sounds = createTable([{ blocks: 5, blockSize: 1, id: 2, size: 4 }]);
    const fixed = Buffer.alloc(28);
    fixed.write("AKPK", "latin1");
    fixed.writeUInt32LE(languageMap.length, 12);
    fixed.writeUInt32LE(banks.length, 16);
    fixed.writeUInt32LE(sounds.length, 20);

    expect(parseAudioPackageHeader(Buffer.concat([fixed, languageMap, banks, sounds]))).toStrictEqual({
      banks: [{ id: 1, offset: 32, size: 3 }],
      sounds: [{ id: 2, offset: 5, size: 4 }],
    });
  });

  test("refuses a file with no magic", () => {
    expect.hasAssertions();

    expect(() => parseAudioPackageHeader(Buffer.alloc(28))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: audio package, has no AKPK magic]`,
    );
  });
});

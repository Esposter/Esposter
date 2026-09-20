import { AKPK_EXTERNAL_ENTRY_BYTES } from "#src/services/voiceMatch/constants";
import { parseAkpkExternals } from "#src/services/voiceMatch/reference/parseAkpkExternals";
import { describe, expect, test } from "vitest";

describe(parseAkpkExternals, () => {
  const COUNT_BYTES = 4;
  const writeEntry = (table: Buffer, index: number, id: bigint, blockSize: number, size: number, block: number) => {
    const cursor = COUNT_BYTES + index * AKPK_EXTERNAL_ENTRY_BYTES;
    table.writeBigUInt64LE(id, cursor);
    table.writeUInt32LE(blockSize, cursor + 8);
    table.writeUInt32LE(size, cursor + 12);
    table.writeUInt32LE(block, cursor + 16);
  };

  test("reads a row's offset in units of its own block size and drops a row with no bytes", () => {
    expect.hasAssertions();

    const table = Buffer.alloc(COUNT_BYTES + AKPK_EXTERNAL_ENTRY_BYTES * 2);
    table.writeUInt32LE(2, 0);
    writeEntry(table, 0, 1n, 2, 1, 1);
    writeEntry(table, 1, 2n, 2, 0, 1);

    expect(parseAkpkExternals(table)).toStrictEqual([{ id: 1n, offset: 2, size: 1 }]);
  });
});

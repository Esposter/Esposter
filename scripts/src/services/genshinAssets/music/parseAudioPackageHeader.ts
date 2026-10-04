import type { AudioPackage } from "#src/models/genshinAssets/music/AudioPackage";
import type { AudioPackageEntry } from "#src/models/genshinAssets/music/AudioPackageEntry";

import { InvalidOperationError, Operation } from "@esposter/shared";

const AUDIO_PACKAGE_MAGIC = "AKPK";
// After the magic, the header's size, its version and the sizes of its language map, bank table and sound table
const LANGUAGE_MAP_SIZE_OFFSET = 12;
const BANK_TABLE_SIZE_OFFSET = 16;
const TABLES_OFFSET = 28;
// An entry: its id, its block size, its size in bytes, its offset in blocks and its language
const ENTRY_LENGTH = 20;
// A Wwise audio package's header (`.pck`), which leads the file and states its own size: a language map, then a table
// Of its sound banks and one of its streamed sounds, each entry's offset counted in blocks of its own size
export const parseAudioPackageHeader = (header: Buffer): AudioPackage => {
  if (header.toString("latin1", 0, AUDIO_PACKAGE_MAGIC.length) !== AUDIO_PACKAGE_MAGIC)
    throw new InvalidOperationError(Operation.Read, "audio package", "has no AKPK magic");
  const readTable = (offset: number): AudioPackageEntry[] =>
    Array.from({ length: header.readUInt32LE(offset) }, (_, index) => {
      const entryOffset = offset + 4 + index * ENTRY_LENGTH;
      return {
        id: header.readUInt32LE(entryOffset),
        offset: header.readUInt32LE(entryOffset + 12) * header.readUInt32LE(entryOffset + 4),
        size: header.readUInt32LE(entryOffset + 8),
      };
    });
  const bankTableOffset = TABLES_OFFSET + header.readUInt32LE(LANGUAGE_MAP_SIZE_OFFSET);
  return {
    banks: readTable(bankTableOffset),
    sounds: readTable(bankTableOffset + header.readUInt32LE(BANK_TABLE_SIZE_OFFSET)),
  };
};

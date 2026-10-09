import type { CabMap } from "#src/models/genshinAssets/shared/CabMap";

// The high bit of each byte of a length says another byte follows, as .NET's BinaryWriter writes one
const LENGTH_CONTINUATION_BIT = 0x80;
const LENGTH_VALUE_BITS = 0x7f;
const LENGTH_BITS_PER_BYTE = 7;
// AnimeStudio's CAB map read from its bytes, as it is written: the base folder, a count, then per CAB its name, its
// Block, its offset in the block and its dependencies, each string prefixed by its length in seven-bit groups. Names
// And blocks are kept as written, which a merge of two maps needs and `parseCabMap` normalises
export const readCabMap = (bytes: Buffer): CabMap => {
  let cursor = 0;
  const readString = (): string => {
    let length = 0;
    for (let shift = 0; ; shift += LENGTH_BITS_PER_BYTE) {
      const byte = bytes[cursor++] ?? 0;
      length |= (byte & LENGTH_VALUE_BITS) << shift;
      if (!(byte & LENGTH_CONTINUATION_BIT)) break;
    }
    const text = bytes.toString("utf8", cursor, cursor + length);
    cursor += length;
    return text;
  };
  const baseFolder = readString();
  const count = bytes.readInt32LE(cursor);
  cursor += 4;
  const records = Array.from({ length: count }, () => {
    const name = readString();
    const block = readString();
    // The CAB's offset in its block, a 64-bit integer a block's size keeps well within a number
    const offset = Number(bytes.readBigInt64LE(cursor));
    cursor += 8;
    const dependencyCount = bytes.readInt32LE(cursor);
    cursor += 4;
    const dependencies = Array.from({ length: dependencyCount }, () => readString());
    return { block, dependencies, name, offset };
  });
  return { baseFolder, records };
};

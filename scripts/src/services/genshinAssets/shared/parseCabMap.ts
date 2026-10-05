import type { CabEntry } from "#src/models/genshinAssets/shared/CabEntry";

// The high bit of each byte of a length says another byte follows, as .NET's BinaryWriter writes one
const LENGTH_CONTINUATION_BIT = 0x80;
const LENGTH_VALUE_BITS = 0x7f;
const LENGTH_BITS_PER_BYTE = 7;
// AnimeStudio's CAB map read from its bytes, which it writes beside itself when it maps the blocks: every serialized
// File (a CAB) of the game's blocks by its name, with the block holding it and the CABs it depends on, in the order of
// Its own table of external references, so a pointer's file index N names its file's dependency N − 1. It is a .NET
// Binary file: the blocks folder, a count, then per CAB its name, its block, its offset in the block and its
// Dependencies, each string prefixed by its length in seven-bit groups. A CAB is named `CAB-` in the map and `cab-`
// Among dependencies, so every name is keyed lowercase, and every block with forward slashes, as the asset index names
// It
export const parseCabMap = (bytes: Buffer): Map<string, CabEntry> => {
  let offset = 0;
  const readString = (): string => {
    let length = 0;
    for (let shift = 0; ; shift += LENGTH_BITS_PER_BYTE) {
      const byte = bytes[offset++] ?? 0;
      length |= (byte & LENGTH_VALUE_BITS) << shift;
      if (!(byte & LENGTH_CONTINUATION_BIT)) break;
    }
    const text = bytes.toString("utf8", offset, offset + length);
    offset += length;
    return text;
  };
  // The blocks folder the map was built over, which every block below is relative to already
  readString();
  const count = bytes.readInt32LE(offset);
  offset += 4;
  const cabMap = new Map<string, CabEntry>();
  for (let index = 0; index < count; index++) {
    const name = readString().toLowerCase();
    const block = readString().replaceAll("\\", "/");
    // The CAB's offset in its block, which nothing here reads
    offset += 8;
    const dependencyCount = bytes.readInt32LE(offset);
    offset += 4;
    const dependencies = Array.from({ length: dependencyCount }, () => readString().toLowerCase());
    cabMap.set(name, { block, dependencies });
  }
  return cabMap;
};

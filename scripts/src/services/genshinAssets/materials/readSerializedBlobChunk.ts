import type { SerializedBlobProgram } from "#src/models/genshinAssets/materials/SerializedBlobProgram";

import { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import { readSerializedBlobProgram } from "#src/services/genshinAssets/materials/readSerializedBlobProgram";

const ENTRY_LENGTH_BYTES = 4;

// A platform's blob chunk, read from its entry count: each entry's offset in the chunk, which is the entry's blob index
export const readSerializedBlobChunk = (chunk: Buffer): SerializedBlobProgram[] => {
  const cursor = new BinaryCursor(chunk);
  const offsets = cursor.list(() => {
    const offset = cursor.int32();
    cursor.skip(ENTRY_LENGTH_BYTES);
    return offset;
  });
  return offsets.map((offset) => readSerializedBlobProgram(chunk, offset));
};

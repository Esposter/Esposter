import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

import { SERIALIZED_WORD_BYTES } from "#src/services/genshinAssets/shared/constants";

// The serialized pointer at an offset: its file's index as a word, then its path ID as a long
export const readObjectPointer = (bytes: Buffer, offset: number): ObjectPointer => ({
  fileIndex: bytes.readInt32LE(offset),
  pathId: bytes.readBigInt64LE(offset + SERIALIZED_WORD_BYTES).toString(),
});

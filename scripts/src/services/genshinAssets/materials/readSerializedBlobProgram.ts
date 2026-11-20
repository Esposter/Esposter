import type { SerializedBlobProgram } from "#src/models/genshinAssets/materials/SerializedBlobProgram";

import { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import { readContainer } from "#src/services/genshinAssets/materials/readContainer";

// A program's version is clamped to this as AnimeStudio does, and its header holds a checksum of twelve bytes after its
// GPU program type, and a four-byte field from this version on
const VERSION_CLAMP = 201_806_140;
const VERSION_WITH_HEADER_FIELD = 201_608_170;
const VERSION_WITH_LOCAL_KEYWORDS_MIN = 201_806_140;
const VERSION_WITH_LOCAL_KEYWORDS_MAX = 202_012_090;
const HEADER_CHECKSUM_BYTES = 12;
const HEADER_FIELD_BYTES = 4;

export const readSerializedBlobProgram = (chunk: Buffer, offset: number): SerializedBlobProgram => {
  const cursor = new BinaryCursor(chunk, offset);
  const version = Math.min(cursor.int32(), VERSION_CLAMP);
  const gpuProgramType = cursor.int32();
  cursor.skip(HEADER_CHECKSUM_BYTES);
  if (version >= VERSION_WITH_HEADER_FIELD) cursor.skip(HEADER_FIELD_BYTES);
  cursor.list(() => cursor.string());
  if (version >= VERSION_WITH_LOCAL_KEYWORDS_MIN && version < VERSION_WITH_LOCAL_KEYWORDS_MAX)
    cursor.list(() => cursor.string());
  return { code: readContainer(cursor.uint8List()), gpuProgramType };
};

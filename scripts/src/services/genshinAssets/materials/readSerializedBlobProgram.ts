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
  const program = new BinaryCursor(chunk, offset);
  const version = Math.min(program.int32(), VERSION_CLAMP);
  const gpuProgramType = program.int32();
  program.skip(HEADER_CHECKSUM_BYTES);
  if (version >= VERSION_WITH_HEADER_FIELD) program.skip(HEADER_FIELD_BYTES);
  program.list(() => program.string());
  if (version >= VERSION_WITH_LOCAL_KEYWORDS_MIN && version < VERSION_WITH_LOCAL_KEYWORDS_MAX)
    program.list(() => program.string());
  return { code: readContainer(program.uint8List()), gpuProgramType };
};

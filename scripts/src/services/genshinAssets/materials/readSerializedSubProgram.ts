import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedSubProgramRecord } from "#src/models/genshinAssets/materials/SerializedSubProgramRecord";

import {
  PARAMETER_FLAG_BYTES,
  VECTOR_OR_MATRIX_PARAMETER_BYTES,
} from "#src/services/genshinAssets/materials/constants";
import { skipAlignedParameters } from "#src/services/genshinAssets/materials/skipAlignedParameters";
import { skipConstantBuffer } from "#src/services/genshinAssets/materials/skipConstantBuffer";
import { skipWordList } from "#src/services/genshinAssets/materials/skipWordList";

const PROGRAM_HASH_BYTES = 16;
const TEXTURE_PARAMETER_BYTES = 12;
const TRAILER_BYTES = 24;
const BUFFER_BINDING_BYTES = 8;
const UAV_BYTES = 12;
const SAMPLER_BYTES = 8;
// The GPU program types the game's enum defines, from its unknown type through PS5's ray-tracing-less NGGC type
const MAX_GPU_PROGRAM_TYPE = 32;

// Reads one program variant's record: its blob index, the keywords that select it, and the GPU program type it is compiled
// For. Its legacy parameter lists are all empty in the game's shaders and read past
export const readSerializedSubProgram = (cursor: BinaryCursor): SerializedSubProgramRecord => {
  const blobIndex = cursor.uint32();
  cursor.bool();
  cursor.align();
  cursor.skip(PROGRAM_HASH_BYTES);
  cursor.int32();
  cursor.list(() => {
    cursor.int8();
    cursor.int8();
  });
  cursor.align();
  cursor.uint32();
  const globalKeywordIndices = cursor.uint16List();
  const localKeywordIndices = cursor.uint16List();
  cursor.int8();
  let gpuProgramType = cursor.int8();
  cursor.align();
  // A record whose GPU program type is unknown or outside the enum is read again, with a keyword list between its
  // Tier and its type, as AnimeStudio reads it for this game alone
  if (gpuProgramType <= 0 || gpuProgramType > MAX_GPU_PROGRAM_TYPE) {
    cursor.rewind(4);
    cursor.uint16List();
    cursor.int8();
    gpuProgramType = cursor.int8();
    cursor.align();
  }
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipAlignedParameters(cursor, TEXTURE_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipWordList(cursor, BUFFER_BINDING_BYTES);
  cursor.list(() => {
    skipConstantBuffer(cursor);
  });
  skipWordList(cursor, BUFFER_BINDING_BYTES);
  skipWordList(cursor, UAV_BYTES);
  skipWordList(cursor, SAMPLER_BYTES);
  cursor.int32();
  cursor.skip(TRAILER_BYTES);
  return { blobIndex, gpuProgramType, keywordIndices: [...globalKeywordIndices, ...localKeywordIndices] };
};

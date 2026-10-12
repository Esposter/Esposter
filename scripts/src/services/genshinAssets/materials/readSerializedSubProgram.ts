import type { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import type { SerializedSubProgramRecord } from "#src/models/genshinAssets/materials/SerializedSubProgramRecord";

const PROGRAM_HASH_BYTES = 16;
const VECTOR_OR_MATRIX_PARAMETER_BYTES = 12;
const TEXTURE_PARAMETER_BYTES = 12;
const TRAILER_BYTES = 24;
const BUFFER_BINDING_BYTES = 8;
const UAV_BYTES = 12;
const SAMPLER_BYTES = 8;
const STRUCT_HEADER_BYTES = 16;
const PARAMETER_FLAG_BYTES = 2;
// Skips a parameter list whose records are read past for the keyword lookup: each record is its fixed words, then an
// Aligned pair of small fields where a parameter carries them
const skipAlignedParameters = (cursor: BinaryCursor, wordBytes: number, flagBytes: number): void => {
  cursor.list(() => {
    cursor.skip(wordBytes + flagBytes);
    cursor.align();
  });
};
const skipWordList = (cursor: BinaryCursor, wordBytes: number): void => {
  cursor.list(() => cursor.skip(wordBytes));
};
const skipConstantBuffer = (cursor: BinaryCursor): void => {
  cursor.int32();
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  cursor.list(() => {
    cursor.skip(STRUCT_HEADER_BYTES);
    skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
    skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  });
  cursor.int32();
};
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
  const gpuProgramType = cursor.int8();
  cursor.align();
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipAlignedParameters(cursor, VECTOR_OR_MATRIX_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipAlignedParameters(cursor, TEXTURE_PARAMETER_BYTES, PARAMETER_FLAG_BYTES);
  skipWordList(cursor, BUFFER_BINDING_BYTES);
  cursor.list(() => skipConstantBuffer(cursor));
  skipWordList(cursor, BUFFER_BINDING_BYTES);
  skipWordList(cursor, UAV_BYTES);
  skipWordList(cursor, SAMPLER_BYTES);
  cursor.int32();
  cursor.skip(TRAILER_BYTES);
  return { blobIndex, gpuProgramType, keywordIndices: [...globalKeywordIndices, ...localKeywordIndices] };
};

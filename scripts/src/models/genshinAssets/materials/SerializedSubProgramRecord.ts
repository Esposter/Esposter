// A program variant as its pass serializes it, its code and keyword names resolved from the blob once the whole shader
// Is read
export interface SerializedSubProgramRecord {
  blobIndex: number;
  gpuProgramType: number;
  keywordIndices: number[];
}

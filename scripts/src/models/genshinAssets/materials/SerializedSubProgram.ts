// One program variant a pass's stage draws with: the blob entry its index names, the GPU program type it is compiled
// For, the keyword names that select it and its compiled container from the DXBC magic on, empty where the variant is
// Not compiled
export interface SerializedSubProgram {
  blobIndex: number;
  code: Buffer;
  gpuProgramType: number;
  keywordIndices: number[];
  keywords: string[];
}

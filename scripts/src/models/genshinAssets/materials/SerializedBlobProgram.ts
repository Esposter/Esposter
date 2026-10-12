// One entry of a platform's blob chunk: the GPU program type it was compiled for and its container from the DXBC magic
// On, or empty where the variant is not compiled for that platform
export interface SerializedBlobProgram {
  code: Buffer;
  gpuProgramType: number;
}

// Releases buffers once the passes that read them have run
export const destroyBuffers = (buffers: GPUBuffer[]): void => {
  for (const buffer of buffers) buffer.destroy();
};
